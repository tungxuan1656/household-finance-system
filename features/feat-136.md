# feat-136 - Worker D1 read latency optimization (replication + batch)

## Goal

Giảm P95 mọi API có auth từ 300-500ms -> <150ms bằng 2 đòn: 1) D1 Read Replication + `withSession` (95ms -> 10ms/read), 2) gộp sequential queries thành batch/Promise.all + bulk IN (5-6 RTT -> 2 RTT).

## Confirmed scope

- Infra: bật D1 read replication `mode:auto` (APAC), thêm `d1SessionMiddleware` global, propagate `x-d1-bookmark`, mọi `c.env.DB` -> `c.get('db')` (session). Write vẫn primary. Không bật Smart Placement.
- App helper: `request-cache.ts` (membership/user per-request memo), `bulk-helpers.ts` (IN queries thay loop).
- Refactor handlers theo DAG:
  - `analytics/*` 4 endpoints: 3 sequential -> `Promise.all` 1 RTT
  - `expenses` (create/list/get/patch + groups patch): loop `findExpenseGroupById` -> `findExpenseGroupsByIds(IN)`
  - `budgets/list`: loop `listBudgetsByHousehold` sequential -> `Promise.all`
  - `households/invitations/others`: `findActiveHouseholdMembership` qua cache (1 lần/request/householdId)
  - `authMiddleware` + `household-membership.ts` dùng session db
- Non-scope: KV/cache API, Smart Placement, schema migration/Index mới không cần (size 1.7MB, rows_read 1-16).

## Non-goals

- Không đổi API contract/response shape
- Không DROP/ALTER tables, không thêm cột
- Không cache KV cho analytics (defer)
- Không đổi logic telegram bot ngoài D1 session

## Acceptance

- [ ] `wrangler.jsonc` có comment/flag replication + `npx wrangler d1 info` show `read_replication:auto` (APAC)
- [ ] `GET /analytics/overview` với household_id: từ 6 RTT sequential (570ms) -> 2 RTT (auth 2 parallel cached + handler 1 batch 3) = P95 <100ms local SIN, verified `workers-observability` log `served_by_primary:false, served_by_region:APAC, durationMS <30ms` cho 3 query batch
- [ ] `POST /expenses` + `PATCH /expenses/:id/groups` với 5 groupIds: từ 5 RTT sequential -> 1 bulk `IN` (1 RTT)
- [ ] `GET /budgets` với user có 5 households: từ N sequential -> `Promise.all` 1 RTT
- [ ] Mọi handler còn lại không còn `await` sequential cho queries độc lập (grep `await find.*` nối tiếp độc lập = 0)
- [ ] `pnpm --filter worker typecheck` `lint` `test` `bash scripts/check_ts_length.sh` `git diff --check` pass, `./init.sh` (worker skip) pass
- [ ] Manual tail 20 req liên tiếp: P95 `durationMS` (d1_first/all) <30ms/read, không lỗi `bookmark` stale

## Handoff

- State: active
- Plan: external -> `docs/plans/feat-136.md`
- Evidence: -
- Blockers: none
- Next: Execute docs/plans/feat-136.md Task 1

## Inline plan

See `docs/plans/feat-136.md` (external per harness: >=4 files, needs phases/rollback). Inline pointer only.
