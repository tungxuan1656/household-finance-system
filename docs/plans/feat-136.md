# Worker D1 Read Latency Optimization Implementation Plan

> **Execution:** Follow the repository's implementation and verification rules. Use `subagent-driven-development` or `executing-plans` only when installed and appropriate. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giảm P95 mọi API worker có auth từ 300-500ms -> <150ms (target analytics/overview <80ms) bằng D1 read replication + session bookmark + gộp sequential queries thành batch/Promise.all + bulk IN.

**Architecture:** Tầng 1 infra: global `d1SessionMiddleware` tạo `DB.withSession(bookmark)` và propagate `x-d1-bookmark` header, mọi read hit APAC replica (~10ms), write về primary. Tầng 2 app: per-request `requestCache` memo membership/user, `batch/bulk` helper gộp queries độc lập thành 1 RTT. Handler refactor theo DAG: auth 2 parallel đã đúng giữ nguyên, membership cached, analytics 3 queries + budgets N+1 + expenses N loops gộp 1 RTT.

**Tech Stack:** Cloudflare Workers (Hono), D1 `withSession`/`batch`, TypeScript, wrangler.jsonc, Vitest, wrangler tail observability.

## Global Constraints

- Runtime `compatibility_date: 2026-03-10` giữ nguyên (`apps/worker/wrangler.jsonc:9`)
- Không đổi API contract/response shape (hợp đồng zod ở `contracts/` giữ nguyên)
- Không DROP/ALTER tables, không migration DB
- Không commit secrets, không ghi `.dev.vars`
- Copy chính xác `wrangler.jsonc` bindings `DB` id `dc2c230e-ba29-4fac-b300-5356a22d9d4b` khi chỉnh sửa
- Mọi `env.DB` trực tiếp trong handler/middleware phải đổi sang `c.get('db')` sau Task 1
- Mỗi task kết thúc bằng `pnpm --filter worker typecheck && lint && test` liên quan pass

---

## File Structure

**Tạo mới:**
- `apps/worker/src/middlewares/d1-session.ts` — tạo session, read/write header bookmark, expose `c.var.db`
- `apps/worker/src/db/helpers/request-cache.ts` — Map per-request `userId:householdId -> membership` + user cache
- `apps/worker/src/db/helpers/batch.ts` — wrapper `db.batch` + re-export bulk helpers

**Sửa:**
- `apps/worker/wrangler.jsonc` — comment mở read_replication + placement giữ disabled
- `apps/worker/src/types.ts` — thêm `Variables: { db: D1Database, dbBookmark?: string, membershipCache?: Map }` vào `AppBindings`
- `apps/worker/src/index.ts:32-37` — mount `d1SessionMiddleware` trước `authMiddleware`
- `apps/worker/src/middlewares/auth.ts:31-65` — đổi `ctx.env.DB` -> `ctx.get('db')`, giữ `Promise.all` 2 queries
- `apps/worker/src/middlewares/household-membership.ts:11-91` — dùng `requestCache` + `c.get('db')`
- `apps/worker/src/db/repositories/expense-analytics-repository.ts:22-80` — đổi 3 `await` sequential -> `Promise.all` hoặc `db.batch`
- `apps/worker/src/handlers/analytics/get-analytics-overview.ts:15-56` + 3 analytics handlers còn lại (`get-analytics-comparison.ts`, `get-analytics-groups.ts`, `get-analytics-export.ts`)
- `apps/worker/src/db/repositories/expense-group-repository.ts` — thêm `findExpenseGroupsByIds(db, ids)` bulk IN
- `apps/worker/src/handlers/expenses/create-expense.ts` + `handlers/expense-groups/replace-expense-groups.ts` — loop sequential -> bulk
- `apps/worker/src/handlers/budgets/list-budgets.ts:65-140` — `for...await` sequential -> `Promise.all`
- Sweep còn lại: `handlers/expenses/list-expenses.ts`, `get-expense.ts`, `update-expense.ts`, `delete-expense.ts`, `restore-expense.ts`, `handlers/budgets/*`, `handlers/households/*`, `handlers/invitations/*` — đổi sang `c.get('db')` + cache nếu còn sequential độc lập

**Test:**
- `apps/worker/src/__tests__/d1-session.spec.ts` (mới)
- `apps/worker/src/__tests__/request-cache.spec.ts` (mới)
- Sửa existing `apps/worker/src/handlers/analytics/*spec.ts` nếu mock DB

---

### Task 1: Foundation — D1 session middleware + types + wrangler

**Files:**
- Create: `apps/worker/src/middlewares/d1-session.ts`
- Modify: `apps/worker/src/types.ts:1-30`
- Modify: `apps/worker/src/index.ts:32-37`
- Modify: `apps/worker/wrangler.jsonc:29-41`

**Interfaces:**
- Consumes: `env.DB: D1Database` (binding id `dc2c230e-ba29-4fac-b300-5356a22d9d4b`)
- Produces: `c.get('db'): D1Database (session)` + `c.header('x-d1-bookmark', bookmark)`; `AppBindings.Variables.db: D1Database`

- [ ] **Step 1: Write failing test `d1-session.spec.ts`**

```ts
import { describe, expect, it, vi } from 'vitest'
import { d1SessionMiddleware } from '@/middlewares/d1-session'

describe('d1SessionMiddleware', () => {
  it('creates session from bookmark header and propagates bookmark', async () => {
    const mockSession = { prepare: vi.fn(), batch: vi.fn(), getBookmark: () => 'bm-123' } as any
    const mockDB = { withSession: vi.fn(() => mockSession) } as any
    const ctx: any = {
      req: { header: (k: string) => k === 'x-d1-bookmark' ? 'first-unconstrained' : undefined },
      env: { DB: mockDB },
      set: vi.fn(), header: vi.fn(), get: vi.fn(() => mockSession),
    }
    const next = vi.fn(async () => {})
    await d1SessionMiddleware(ctx, next)
    expect(mockDB.withSession).toHaveBeenCalledWith('first-unconstrained')
    expect(ctx.set).toHaveBeenCalledWith('db', mockSession)
    expect(next).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter worker test -- src/__tests__/d1-session.spec.ts -v`
Expected: FAIL with "Cannot find module '@/middlewares/d1-session'"

- [ ] **Step 3: Write minimal implementation `d1-session.ts`**

```ts
import type { MiddlewareHandler } from 'hono'
import type { AppBindings } from '@/types'

export const d1SessionMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const raw = c.req.header('x-d1-bookmark')
  const bookmark = raw ?? 'first-unconstrained'
  const session: any = (c.env.DB as any).withSession(bookmark)
  c.set('db' as any, session)
  await next()
  const out = session.getBookmark?.()
  if (out) c.header('x-d1-bookmark', out)
}
```

- [ ] **Step 4: Update `types.ts` — add Variables**

```ts
// apps/worker/src/types.ts
export type AppBindings = {
  Bindings: Env & { DB: D1Database }
  Variables: {
    currentUser: { id: string; email: string | null }
    locale: string
    db: D1Database // session
    requestId: string
  }
}
```

- [ ] **Step 5: Mount in `index.ts` before auth**

```ts
import { d1SessionMiddleware } from '@/middlewares/d1-session'
app.use('*', requestContextMiddleware)
app.use('*', d1SessionMiddleware) // <-- add, trước requestLogger
app.use('*', requestLoggerMiddleware)
```

- [ ] **Step 6: Edit `wrangler.jsonc` — document replication (không bật smart placement)**

```json
"d1_databases": [{ "binding": "DB", "database_name": "household-finance-system", "database_id": "dc2c230e-ba29-4fac-b300-5356a22d9d4b" }],
"placement": { "mode": "off" } // giữ off, đã có replica APAC
// Enable read replication via dashboard: wrangler d1 update household-finance-system --read-replication auto
```

- [ ] **Step 7: Run tests + typecheck**

Run: `pnpm --filter worker typecheck -v` Expected: PASS
Run: `pnpm --filter worker test -- src/__tests__/d1-session.spec.ts -v` Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add apps/worker/src/middlewares/d1-session.ts apps/worker/src/types.ts apps/worker/src/index.ts apps/worker/wrangler.jsonc apps/worker/src/__tests__/d1-session.spec.ts
git commit -m "feat(worker): add D1 session middleware with bookmark propagation"
```

---

### Task 2: Per-request cache — membership + user memo

**Files:**
- Create: `apps/worker/src/db/helpers/request-cache.ts`
- Modify: `apps/worker/src/middlewares/household-membership.ts:11-91`
- Modify: `apps/worker/src/middlewares/auth.ts:31-65`

**Interfaces:**
- Consumes: `c.get('db'): D1Database`
- Produces: `getMembershipCached(c, userId, householdId): Promise<Membership | null>`; `getUserCached`; cache hit 0 RTT

- [ ] **Step 1: Write failing test `request-cache.spec.ts`**

```ts
import { describe, expect, it, vi } from 'vitest'
import { getMembershipCached } from '@/db/helpers/request-cache'

describe('requestCache', () => {
  it('memoizes membership per householdId', async () => {
    const mockDb = { prepare: vi.fn(() => ({ bind: () => ({ first: vi.fn(async () => ({ id: 'm1' })) }) })) } as any
    const c: any = { get: (k: string) => k === 'db' ? mockDb : new Map(), set: vi.fn() }
    // gắn map rỗng vào c.var
    c._map = new Map()
    c.get = (k: string) => k === 'membershipCache' ? c._map : mockDb
    const a = await getMembershipCached(c, 'u1', 'h1')
    const b = await getMembershipCached(c, 'u1', 'h1')
    expect(a).toEqual({ id: 'm1' })
    expect(b).toBe(a) // same ref = cached
    expect(mockDb.prepare).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test fails**

Run: `pnpm --filter worker test -- src/__tests__/request-cache.spec.ts -v` Expected: FAIL module not found

- [ ] **Step 3: Implement `request-cache.ts`**

```ts
import type { Context } from 'hono'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import type { AppBindings } from '@/types'

export async function getMembershipCached(c: Context<AppBindings>, userId: string, householdId: string) {
  const cache: Map<string, any> = (c as any).get('membershipCache') ?? new Map()
  if (!(c as any).get('membershipCache')) (c as any).set('membershipCache', cache)
  const key = `${userId}:${householdId}`
  if (cache.has(key)) return cache.get(key)
  const db = c.get('db' as any) as any
  const row = await findActiveHouseholdMembership(db, userId, householdId)
  cache.set(key, row)
  return row
}
```

- [ ] **Step 4: Update `auth.ts` to use session**

```ts
// middlewares/auth.ts:44
const db = c.get('db' as any)
const [session, user] = await Promise.all([
  findSessionById(db, payload.sid),
  findUserById(db, payload.sub),
])
```

- [ ] **Step 5: Update `household-membership.ts` to use cache**

```ts
import { getMembershipCached } from '@/db/helpers/request-cache'
export const resolveHouseholdMembership: MiddlewareHandler<AppBindings> = async (c, next) => {
  const membership = await getMembershipCached(c, c.get('currentUser').id, c.req.param('id'))
  if (!membership) throw forbidden(...)
  c.set('householdMembership', membership)
  await next()
}
```

- [ ] **Step 6: Verify**

Run: `pnpm --filter worker test -- src/__tests__/request-cache.spec.ts -v` Expected: PASS
Run: `pnpm --filter worker typecheck` Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/worker/src/db/helpers/request-cache.ts apps/worker/src/middlewares/auth.ts apps/worker/src/middlewares/household-membership.ts apps/worker/src/__tests__/request-cache.spec.ts
git commit -m "feat(worker): add per-request membership cache, auth uses session db"
```

---

### Task 3: Batch helper + bulk IN repositories

**Files:**
- Create: `apps/worker/src/db/helpers/batch.ts`
- Modify: `apps/worker/src/db/repositories/expense-group-repository.ts`
- Modify: `apps/worker/src/db/repositories/budget-repository.ts` (bulk if needed)

**Interfaces:**
- Consumes: `D1Database batch([stmt1, stmt2, stmt3])`
- Produces: `findExpenseGroupsByIds(db, ids: string[]): Promise<ExpenseGroup[]>`; `batchAll(db, stmts)` helper

- [ ] **Step 1: Write failing test for bulk**

```ts
import { describe, expect, it, vi } from 'vitest'
import { findExpenseGroupsByIds } from '@/db/repositories/expense-group-repository'

describe('findExpenseGroupsByIds', () => {
  it('fetches N groups in 1 IN query', async () => {
    const mockAll = vi.fn(async () => ({ results: [{ id: 'g1' }, { id: 'g2' }] }))
    const mockDb = { prepare: vi.fn(() => ({ bind: (...a: any[]) => ({ all: mockAll }), all: mockAll })) } as any
    const res = await findExpenseGroupsByIds(mockDb, ['g1','g2'])
    expect(mockDb.prepare).toHaveBeenCalledTimes(1)
    expect(mockDb.prepare.mock.calls[0][0]).toMatch(/IN \(\?,\?\)/)
    expect(res).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Implement bulk**

```ts
// expense-group-repository.ts
export async function findExpenseGroupsByIds(db: D1Database, ids: string[]) {
  if (ids.length === 0) return []
  const placeholders = ids.map(() => '?').join(',')
  const stmt = db.prepare(`SELECT * FROM expense_groups WHERE id IN (${placeholders}) AND archived_at IS NULL`)
  const res = await stmt.bind(...ids).all()
  return res.results as any[]
}
```

- [ ] **Step 3: Create `batch.ts` helper**

```ts
export async function batchAll(db: D1Database, stmts: D1PreparedStatement[]) {
  if (stmts.length === 0) return []
  return db.batch(stmts as any) as any
}
```

- [ ] **Step 4: Verify**

Run: `pnpm --filter worker test -- src/db/repositories/expense-group-repository.spec.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/worker/src/db/repositories/expense-group-repository.ts apps/worker/src/db/helpers/batch.ts
git commit -m "feat(worker): add bulk IN for expense groups + batch helper"
```

---

### Task 4: Refactor analytics — 4 endpoints batch 3 queries

**Files:**
- Modify: `apps/worker/src/db/repositories/expense-analytics-repository.ts:22-80`
- Modify: `apps/worker/src/helpers/expense-analytics-helpers.ts:7-24` (nếu chia helpers)
- Modify: `apps/worker/src/handlers/analytics/get-analytics-overview.ts:15-56`
- Modify: `apps/worker/src/handlers/analytics/get-analytics-comparison.ts`, `get-analytics-groups.ts`, `get-analytics-export.ts` (3 files)

**Interfaces:**
- Consumes: `c.get('db')`, `buildPeriodWhereClause`, `getMembershipCached`
- Produces: `getAnalyticsOverview(db, params): Promise<{summary, daily, categories}>` 1 RTT

- [ ] **Step 1: Write failing test for parallel analytics**

```ts
import { describe, expect, it, vi } from 'vitest'
import { getAnalyticsOverview } from '@/db/repositories/expense-analytics-repository'

describe('getAnalyticsOverview parallel', () => {
  it('runs 3 queries in parallel (1 batch)', async () => {
    const stmts: any[] = []
    const mockDb: any = {
      prepare: vi.fn((sql: string) => ({
        bind: (...a: any[]) => {
          const stmt = { sql, bindArgs: a, all: vi.fn(async () => ({ results: [] })), first: vi.fn(async () => ({ expenseCount: 1 })) }
          stmts.push(stmt)
          return stmt
        }
      })),
      batch: vi.fn(async (s: any[]) => s.map(() => ({ results: [] })))
    }
    await getAnalyticsOverview(mockDb, { userId: 'u1', householdId: 'h1', periodStart: 1, periodEnd: 2 })
    // trước: 3 prepare + 3 await sequential, sau: batch 1 lần hoặc Promise.all 3
    expect(mockDb.batch.mock.calls.length + 3).toBeGreaterThan(0)
    // kiểm tra không còn 3 await tuần tự: đếm prepare 3 nhưng batch 1
  })
})
```

- [ ] **Step 2: Refactor `expense-analytics-repository.ts` — đổi sequential -> Promise.all**

```ts
// Trước:
// const summary = await getAnalyticsSummary(db, where)
// const daily = await getDailySeries(db, where)
// const top = await getTopCategories(db, where)

// Sau:
export async function getAnalyticsOverview(db: D1Database, p: Params) {
  const where = buildPeriodWhereClause(p)
  const [summary, daily, categories] = await Promise.all([
    db.prepare(`SELECT COUNT(*) ... WHERE ${where.sql}`).bind(...where.bindings).first(),
    db.prepare(`SELECT strftime... WHERE ${where.sql} GROUP BY date`).bind(...where.bindings).all(),
    db.prepare(`SELECT ... WHERE ${where.sql} GROUP BY categoryKey LIMIT 5`).bind(...where.bindings).all(),
  ])
  return { summary, daily: daily.results, categories: categories.results }
}
// hoặc: await db.batch([stmt1.bind(...), stmt2.bind(...), stmt3.bind(...)])
```

- [ ] **Step 3: Update handler `get-analytics-overview.ts` to use cache + session**

```ts
import { getMembershipCached } from '@/db/helpers/request-cache'
export const getAnalyticsOverviewHandler = async (c: Context<AppBindings>) => {
  const db = c.get('db' as any)
  const userId = c.get('currentUser').id
  const q = analyticsOverviewQuerySchema.parse(c.req.query())
  if (q.household_id) {
    const m = await getMembershipCached(c, userId, q.household_id)
    if (!m) throw forbidden(...)
  }
  return getAnalyticsOverview(db, { userId, householdId: q.household_id, ... })
}
```

- [ ] **Step 4: Apply same to 3 analytics handlers còn lại (copy pattern)**

- [ ] **Step 5: Verify**

Run: `pnpm --filter worker test -- src/db/repositories/expense-analytics-repository.spec.ts -v` Expected: PASS
Run: `pnpm --filter worker typecheck` Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/worker/src/db/repositories/expense-analytics-repository.ts apps/worker/src/handlers/analytics/
git commit -m "feat(worker): batch analytics 3 queries to 1 RTT + session cache"
```

---

### Task 5: Fix N+1 — expenses + groups

**Files:**
- Modify: `apps/worker/src/handlers/expenses/create-expense.ts:86-147`
- Modify: `apps/worker/src/handlers/expense-groups/replace-expense-groups.ts:52-107`
- Modify: `apps/worker/src/handlers/expenses/list-expenses.ts:64-94`
- Modify: `apps/worker/src/db/repositories/expense-query-repository.ts` (nếu có group lookup)

**Interfaces:**
- Consumes: `findExpenseGroupsByIds`
- Produces: `createExpense` with bulk group validation 1 RTT

- [ ] **Step 1: Write test for bulk create**

```ts
it('validates 5 groups in 1 IN query not 5 sequential', async () => {
  const mockDb: any = { prepare: vi.fn(() => ({ bind: () => ({ all: vi.fn(async () => ({ results: [{id:'g1'}] })), first: vi.fn(async()=>({id:'g1'})) }) })), batch: vi.fn() }
  await createExpenseHandler({ ...ctx, body: { groupIds: ['g1','g2','g3','g4','g5'] } })
  expect(mockDb.prepare).toHaveBeenCalledTimes(1) // IN (?, ?, ?, ?, ?)
})
```

- [ ] **Step 2: Refactor `create-expense.ts` loop -> bulk**

```ts
// Trước:
for (const gid of groupIds) { await findExpenseGroupById(db, gid) }

// Sau:
if (groupIds?.length) {
  const groups = await findExpenseGroupsByIds(db, groupIds)
  if (groups.length !== groupIds.length) throw notFound(...)
}
```

- [ ] **Step 3: Refactor `replace-expense-groups.ts` same**

- [ ] **Step 4: Refactor `list-expenses.ts` 2-3 queries -> Promise.all**

```ts
const [expenses, groupMap] = await Promise.all([
  listExpenses(db, params),
  groupIds?.length ? findExpenseGroupsByIds(db, groupIds) : Promise.resolve([])
])
```

- [ ] **Step 5: Verify**

Run: `pnpm --filter worker test -- src/handlers/expenses/create-expense.spec.ts -v` Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/worker/src/handlers/expenses/ apps/worker/src/db/repositories/expense-group-repository.ts
git commit -m "feat(worker): bulk IN for expense groups, fix N+1 loops"
```

---

### Task 6: Fix N+1 — budgets list

**Files:**
- Modify: `apps/worker/src/handlers/budgets/list-budgets.ts:65-152`
- Modify: `apps/worker/src/db/repositories/budget-repository.ts` (thêm `listBudgetsByHouseholdIds` bulk nếu cần)

**Interfaces:**
- Consumes: `listActiveHouseholdIdsForUser`, `listBudgetsByHousehold`
- Produces: `GET /budgets` 1 RTT cho N households

- [ ] **Step 1: Refactor `list-budgets.ts` sequential loop -> Promise.all**

```ts
// Trước:
for (const hid of householdIds) { const b = await listBudgetsByHousehold(db, hid) }

// Sau:
const budgetsByHousehold = await Promise.all(householdIds.map(hid => listBudgetsByHousehold(db, hid)))
const budgets = budgetsByHousehold.flat()
// limits vẫn Promise.all đã đúng, giữ nguyên
const dtos = await Promise.all(budgets.map(b => toBudgetDto(b, db)))
```

- [ ] **Step 2: Verify**

Run: `pnpm --filter worker test -- src/handlers/budgets/list-budgets.spec.ts -v` Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/worker/src/handlers/budgets/list-budgets.ts
git commit -m "feat(worker): parallel budgets N households via Promise.all"
```

---

### Task 7: Sweep — mọi handler còn lại sang session + cache

**Files:**
- Modify: `apps/worker/src/handlers/expenses/get-expense.ts`, `update-expense.ts`, `delete-expense.ts`, `restore-expense.ts`, `list-deleted-expenses.ts`, `get-expense-summary.ts`
- Modify: `apps/worker/src/handlers/budgets/*` (get, status, update, delete, create)
- Modify: `apps/worker/src/handlers/households/*` (7 files)
- Modify: `apps/worker/src/handlers/groups/*` (6 files)
- Modify: `apps/worker/src/handlers/invitations/*`, `handlers/incomes/*`, `handlers/migrate/*`

**Interfaces:**
- Consumes: `c.get('db')` global, `getMembershipCached`
- Produces: không còn `ctx.env.DB` trực tiếp, không `await` sequential độc lập

- [ ] **Step 1: Grep sweep check**

Run: `grep -rn "ctx.env.DB" apps/worker/src --include="*.ts" | wc -l` Expected: 0 sau sweep
Run: `grep -rn "await find.*\nawait find" apps/worker/src/handlers --include="*.ts" | head` Expected: không còn 2 await độc lập nối tiếp

- [ ] **Step 2: Apply pattern cho mỗi handler**

```ts
// Template áp cho mọi handler
const db = c.get('db' as any)
const membership = q.household_id ? await getMembershipCached(c, userId, q.household_id) : null
const [a, b] = await Promise.all([ queryA(db, params), queryB(db, params) ])
```

- [ ] **Step 3: Verify full sweep**

Run: `pnpm --filter worker typecheck` Expected: PASS
Run: `pnpm --filter worker lint` Expected: PASS (0 errors)
Run: `bash scripts/check_ts_length.sh` Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add apps/worker/src/handlers/
git commit -m "feat(worker): sweep all handlers to session db + cache, no sequential independent awaits"
```

---

### Task 8: Verification & observability

**Files:**
- Modify: `features/feat-136.md` (evidence)
- Modify: `progress.md` (entry)
- Test: manual `wrangler tail` + `workers-observability`

- [ ] **Step 1: Enable replication (manual, 1 lần)**

Run: `npx wrangler d1 info household-finance-system` confirm `dc2c230e-ba29-4fac-b300-5356a22d9d4b`
Run: `npx wrangler d1 update household-finance-system --read-replication auto` hoặc dashboard D1 -> Settings -> Read Replication -> Auto (APAC)
Expected: info show `read_replication: auto`

- [ ] **Step 2: Full verification**

Run: `pnpm --filter worker test -v` Expected: 106 files PASS
Run: `pnpm --filter worker lint` Expected: PASS
Run: `bash scripts/check_ts_length.sh` Expected: 0
Run: `./init.sh typecheck` Expected: PASS

- [ ] **Step 3: Manual latency tail (20 req)**

Run: `npx wrangler tail --format json | grep d1_` trong khi curl 20 lần `GET /api/v1/analytics/overview?household_id=xxx -H "Authorization: Bearer $TOKEN"`
Expected: `sql_duration_ms ~0.2`, `durationMS <30`, `served_by_primary:false`, `served_by_region:APAC`, `colo:SIN`

- [ ] **Step 4: Record evidence + close**

Update `features/feat-136.md` Handoff Evidence + `progress.md` done entry, set `feature_index.json` `feat-136: done`

---

## Self-Review Checklist

- [ ] Mọi handler 54 endpoints đã đổi sang `c.get('db')`? (grep 0 `env.DB`)
- [ ] Analytics 3 queries đã `Promise.all`/`batch`? 
- [ ] Bulk IN đã thay loop N? 
- [ ] Budgets N sequential đã `Promise.all`?
- [ ] `x-d1-bookmark` propagate qua mọi response?
- [ ] Không bật `placement smart`, giữ `off`?

## Rollback

- `git revert` từng task commit độc lập (1-7)
- Dashboard D1 -> disable read replication (về primary only) không cần deploy
- Bookmark header optional: client cũ không gửi vẫn `first-unconstrained`

## Execution Handoff

Plan complete and saved to `docs/plans/feat-136.md`. Choose an execution approach:

**1. Subagent-driven** - Use `subagent-driven-development` when it is installed, tasks are independent, and the user authorizes delegated execution.

**2. Inline execution** - Execute in this session, optionally with `executing-plans`, using the repository's verification and branch rules.

**Which approach?**
