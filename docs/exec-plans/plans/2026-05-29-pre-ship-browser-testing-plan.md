# Pre-Ship Browser Testing Plan

## Purpose / Big Picture

Create an execution-ready plan for final browser testing before shipping the web product. The tester will use `playwright-cli` to verify mobile layout, protected navigation, core expense flows, and data consistency across the UI and API. This plan does not execute tests; it defines what to test, how to test it, what evidence to capture, and what result is expected.

## Scope

- In scope:
  - Browser testing plan for `apps/web` protected product surfaces.
  - Primary tool: `playwright-cli`.
  - Optional equivalent tool: Chrome DevTools MCP only if it can capture the same screenshots, console/network evidence, and DOM assertions.
  - Layout review for mobile and desktop using:
    - `docs/FRONTEND.md`
    - `docs/references/frontend/web/protected-page-surface-pattern.md`
    - `docs/references/frontend/web/responsive-navigation-shell-pattern.md`
    - `docs/design-docs/frontend/web/protected-shell-and-tab-surfaces.md`
    - `.agents/skills/ui-ux-review/*`
  - Main flow and data checks for:
    - sign-in/session
    - four protected top-level surfaces
    - add expense
    - expense feed search/summary
    - personal analytics API consistency
    - household creation and household-scoped expense smoke
    - contextual groups/budgets smoke when household data exists
  - Evidence format:
    - screenshots for layout review
    - Playwright snapshots for interaction checkpoints
    - console/network output for runtime health
    - API response excerpts for data truth
- Files changed by this planning session:
  - `docs/exec-plans/plans/2026-05-29-pre-ship-browser-testing-plan.md`
  - `docs/exec-plans/index.md`
  - `harness/feature_index.json`
  - `harness/features/feat-075.json`
  - `harness/progress.md`
- Out of scope:
  - Running the tests in this session.
  - Changing app behavior or layout.
  - Adding component/page render tests in `apps/web`.
  - Deploying, deleting production data, or using a personal real account.
  - Recording passwords, refresh tokens, access tokens, or Firebase credentials in docs, screenshots, logs, or harness artifacts.

## Non-negotiable Requirements

- The tester must not commit test credentials. Use `E2E_EMAIL` and `E2E_PASSWORD` environment variables.
- Screenshots are required for layout review. Layout quality cannot be accepted from DOM snapshots alone.
- Screenshots and logs must be treated as test evidence. Redact tokens and any non-test personal data before sharing outside the team.
- Use a dedicated test account and test data names prefixed with `PreShip`.
- Mutating test flows must create unique records and clean them up when possible.
- Mobile layout review must use at least `390x844` and one narrow viewport such as `360x740`.
- Desktop layout review must use at least `1440x900`.
- Expected product navigation: `Chi tiêu`, `Phân tích`, `Gia đình`, `Tài khoản`. These are the correct tab labels — no mismatch to record.
- The final test report must include a `Ship`, `Ship with minor fixes`, `Needs revision`, or `Redesign required` verdict for layout.

## Progress

- [x] 2026-05-29 Read required workflow, frontend, testing, security, product, route, and UI-review references. Owner: Orchestrator.
- [x] 2026-05-29 Create this Playwright-based pre-ship test plan. Owner: Orchestrator.
- [ ] Execute environment preflight. Owner: future tester.
- [ ] Execute authentication and navigation smoke. Owner: future tester.
- [ ] Capture mobile and desktop layout screenshots. Owner: future layout-review agent.
- [ ] Execute expense create/search/API/analytics data checks. Owner: future data-flow tester.
- [ ] Execute household/group/budget contextual smoke where setup allows. Owner: future data-flow tester.
- [ ] Clean up `PreShip` records where possible. Owner: future tester.
- [ ] Compile final pre-ship test report and ship verdict. Owner: future orchestrator.

## Surprises & Discoveries

- `apps/web/.env` currently points `NEXT_PUBLIC_API_BASE_URL` at `http://100.116.7.43:8787/api/v1`; the tester must confirm whether that is the target pre-ship API or override it intentionally.
- The add-expense flow uses a three-step drawer and VND thousand-shortcut semantics. Typing `35` should create `amountMinor: 35000`.
- `.claude/skills/playwright-cli/SKILL.md` and `.claude/skills/subagent-driven-development/SKILL.md` are present and match the project-owned skill content.

## Decision Log

- Decision: Use `playwright-cli` as the canonical test tool.
  Rationale: It is installed, documented in the repo skills, supports screenshots, snapshots, console/network inspection, persisted auth state, viewport resize, and direct Playwright locator assertions.
  Date/Author: 2026-05-29 / Orchestrator
- Decision: Do not put the provided test password in this plan.
  Rationale: `docs/SECURITY.md` forbids hardcoding secrets in source or docs. Runtime credentials belong in environment variables.
  Date/Author: 2026-05-29 / Orchestrator
- Decision: Require screenshots for layout review.
  Rationale: Mobile fit, overlap, spacing, hierarchy, and visual consistency need visual evidence. Accessibility snapshots are useful but insufficient.
  Date/Author: 2026-05-29 / Orchestrator
- Decision: Use subagent-style lanes only during execution, not during this planning session.
  Rationale: The user asked for a plan only. Future execution can split read-only layout review from mutating data-flow tests, but shared-account data mutations must stay sequenced.
  Date/Author: 2026-05-29 / Orchestrator

## Outcomes & Retrospective

- Pending execution. Expected outcome: a future tester can run this plan end to end, gather screenshots/API evidence, decide whether the product can ship, and report exact blockers.

## Context and Orientation

- Public auth route:
  - `apps/web/src/app/(public)/sign-in/page.tsx`
  - `apps/web/src/features/auth/pages/sign-in-page.tsx`
- Protected shell:
  - `apps/web/src/app/(protected)/layout.tsx`
  - `apps/web/src/components/layouts/main-layout.tsx`
  - `apps/web/src/components/layouts/app-top-nav.tsx`
  - `apps/web/src/components/layouts/bottom-tab.tsx`
- Route and nav constants:
  - `apps/web/src/lib/constants/paths.ts`
  - `apps/web/src/lib/constants/navigation.ts`
- Main protected route surfaces:
  - `/expenses` -> `apps/web/src/features/expenses/pages/expenses-page.tsx`
  - `/insights` -> `apps/web/src/features/insights/pages/insights-page.tsx`
  - `/households` -> `apps/web/src/features/households/pages/households-page.tsx`
  - `/account` -> `apps/web/src/features/account/pages/account-page.tsx`
  - `/account/settings` -> `apps/web/src/features/settings/pages/account-settings-page.tsx`
  - `/groups` -> `apps/web/src/features/groups/pages/groups-page.tsx`
  - `/budgets` -> `apps/web/src/features/budgets/pages/budgets-page.tsx`
- Main API surfaces checked by browser/API evidence:
  - `POST /api/v1/auth/provider/exchange`
  - `GET /api/v1/users/me`
  - `POST /api/v1/expenses`
  - `GET /api/v1/expenses`
  - `GET /api/v1/expenses/summary`
  - `GET /api/v1/analytics/overview`
  - `POST /api/v1/households`
  - `DELETE /api/v1/expenses/:id`
  - `DELETE /api/v1/households/:id` for cleanup of one-member `PreShip` households

## Required Standards / Reference Docs

- `docs/FRONTEND.md`
  - Mobile-first layout.
  - Protected pages use shared page wrappers.
  - Loading, empty, success, error, retry states are part of normal frontend verification.
  - No component/page render tests in `apps/web`; use browser/manual evidence for UI behavior.
- `docs/references/frontend/web/protected-page-surface-pattern.md`
  - `PageContainer`, `PageHeader`, `PageContent`, and `PageFooter` own page structure.
  - Header/content/footer must work with the bottom tab visible.
  - Floating actions and bottom drawers must not be covered by the bottom tab.
- `docs/references/frontend/web/responsive-navigation-shell-pattern.md`
  - Desktop/tablet `>= 768px`: top navigation.
  - Mobile `< 768px`: fixed bottom tab bar.
  - Both nav surfaces must use the same route source and active-state logic.
  - Bottom tabs must not clip or cover content.
  - Modals/sheets must appear above navigation.
- `docs/design-docs/frontend/web/protected-shell-and-tab-surfaces.md`
  - Protected entry is the Expense surface.
  - Four top-level tabs are Expense, Analysis, Household, Settings.
  - Mobile app shape is primary; desktop preserves the same mental model.
  - Add expense is a three-step bottom drawer.
- `.agents/skills/ui-ux-review/rubric.md`
  - Score task support, hierarchy, clarity, mobile usability, navigation, visual consistency, accessibility, responsive readiness, state handling, and implementation risk.
- `.agents/skills/ui-ux-review/checklists/mobile.md`
  - Check 44px touch targets, no horizontal scroll, no bottom-nav/FAB overlap, usable one-handed layout, and sheet/drawer usage.
- `.agents/skills/ui-ux-review/checklists/finance-app.md`
  - Amounts must be clearly labeled, currency must be consistent, date ranges human-readable, and transaction cards scannable.
- `docs/SECURITY.md`
  - No hardcoded credentials.
  - Redact tokens and personal data from logs/screenshots.

## Plan of Work (Narrative)

1. **Prepare environment and credentials safely.**
   - Decide the target environment: local web + local/remote worker, staging, or production-like pre-ship environment.
   - Set `APP_URL`, `API_BASE_URL`, `E2E_EMAIL`, and `E2E_PASSWORD` in the shell.
   - Confirm the app and API are reachable before opening the browser.

2. **Authenticate once and save browser state.**
   - Clear the Playwright profile.
   - Sign in with the test account through the UI.
   - Expect redirect to `/expenses`.
   - Save Playwright state so future lanes can reuse auth without repeatedly typing credentials.

3. **Run mobile shell/navigation checks.**
   - Resize to `390x844`.
   - Visit `/expenses`, `/insights`, `/households`, and `/account`.
   - Capture screenshots for each surface.
   - Assert one fixed bottom nav, four top-level labels, no horizontal overflow, no overlapped controls, and correct active state.

4. **Run desktop shell/navigation checks.**
   - Resize to `1440x900`.
   - Visit the same four surfaces.
   - Assert top nav is visible, mobile bottom nav is hidden, content remains centered, and nav labels match mobile.

5. **Run expense data flow.**
   - Open the add-expense drawer from `/expenses`.
   - Create one personal `PreShip` food expense with amount input `35`, source `Tiền mặt`, and a unique note.
   - Expect API response `amountMinor: 35000`, `categoryKey: food`, `sourceKey: cash`, `householdId: null`, and no group IDs.
   - Search the expense feed by the unique note and confirm the row appears.
   - Confirm `/expenses/summary` and personal `/analytics/overview` include the new amount.

6. **Run household-scoped smoke.**
   - Create a `PreShip Household` from `/households`.
   - Use the add-expense drawer to create one household expense attached to that household.
   - Expect the API response to include the created `householdId`.
   - Confirm household list/detail reflect the household and its spending.
   - Clean up the household expense and household if the account remains a one-member admin household.

7. **Run contextual group/budget smoke when setup allows.**
   - From `/account`, navigate to groups and budgets.
   - If the account has at least one household, create or verify one group and one budget with `PreShip` names/periods.
   - Confirm group/budget surfaces are reachable from the settings/account management surface, not top-level mobile tabs.
   - If no household exists, record this as environment setup missing, not product failure.

8. **Review screenshots with UI/UX rubric.**
   - The layout-review agent scores each captured mobile screenshot.
   - The review must call out concrete evidence and a final verdict.
   - A layout can ship only if no Critical or High issues remain.

9. **Collect final evidence and cleanup.**
   - Capture console errors and network request failures.
   - Delete `PreShip` expenses and archive/delete `PreShip` household records where safe.
   - Save final report paths and verdict.

## Concrete Steps (Commands)

Run commands from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless stated otherwise.

### 0. Environment Setup

Use the target pre-ship URL. Defaults below match local Next.js and the current web env API base. The tester types the provided test email and password interactively so they are not stored in this plan.

```bash
export APP_URL="${APP_URL:-http://localhost:3000}"
export API_BASE_URL="${API_BASE_URL:-http://100.116.7.43:8787/api/v1}"
read -r E2E_EMAIL
read -rs E2E_PASSWORD
printf '\n'
export E2E_EMAIL E2E_PASSWORD
mkdir -p .playwright-cli/pre-ship
```

Expected:

```text
No output except the prompt echo behavior from read/printf. The shell now has APP_URL, API_BASE_URL, E2E_EMAIL, and E2E_PASSWORD set.
```

If running locally, start app servers in separate terminals:

```bash
pnpm dev:web
```

Optional local worker setup if not using the configured remote API:

```bash
pnpm --filter worker db:migrate:local
pnpm --filter worker db:seed:local
pnpm dev:worker
```

Expected:

```text
Web serves APP_URL.
API health endpoint responds at API_BASE_URL/health.
```

Preflight API check:

```bash
curl -sSf "$API_BASE_URL/health"
```

Expected:

```text
HTTP 200 response. Body may be an API envelope or health payload, but curl must exit 0.
```

### 1. Sign In And Save State

```bash
playwright-cli delete-data
playwright-cli open --browser=chrome "$APP_URL/sign-in"
playwright-cli run-code "async page => {
  const email = process.env.E2E_EMAIL
  const password = process.env.E2E_PASSWORD
  if (!email || !password) throw new Error('Set E2E_EMAIL and E2E_PASSWORD')
  await page.getByLabel('Địa chỉ email').fill(email)
  await page.getByLabel('Mật khẩu').fill(password)
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/expenses', { timeout: 30000 }),
    page.getByRole('button', { name: 'Đăng nhập' }).click(),
  ])
  return { url: page.url(), title: await page.title() }
}"
playwright-cli snapshot --filename=.playwright-cli/pre-ship/01-after-sign-in.yml
playwright-cli state-save .playwright-cli/pre-ship/auth.json
```

Expected:

```text
Returned URL ends with /expenses.
Snapshot contains the protected Expense page, not the sign-in form.
State file exists at .playwright-cli/pre-ship/auth.json.
```

### 2. Mobile Layout And Navigation Evidence

```bash
playwright-cli resize 390 844
playwright-cli goto "$APP_URL/expenses"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/mobile-01-expenses.png
playwright-cli goto "$APP_URL/insights"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/mobile-02-insights.png
playwright-cli goto "$APP_URL/households"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/mobile-03-households.png
playwright-cli goto "$APP_URL/account"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/mobile-04-settings-or-account.png
```

Expected:

```text
Four screenshots exist.
Each screenshot shows mobile content plus one fixed bottom tab bar.
No content, FAB, button, input, or sheet footer is hidden behind the bottom tab bar.
```

Run this assertion on each mobile top-level URL after `goto`:

```bash
playwright-cli run-code "async page => {
  const nav = page.getByRole('navigation', { name: 'Các mục ứng dụng' })
  await nav.waitFor({ state: 'visible', timeout: 10000 })
  const labels = (await nav.getByRole('link').allInnerTexts()).map((s) => s.trim()).filter(Boolean)
  const expected = ['Chi tiêu', 'Phân tích', 'Gia đình', 'Tài khoản']
  const missing = expected.filter((label) => !labels.includes(label))
  const bottomNavBox = await nav.boundingBox()
  const viewport = page.viewportSize()
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  const overlapped = await page.evaluate(() => {
    const navElement = document.querySelector('nav[aria-label=\"Các mục ứng dụng\"]')
    if (!navElement) return ['missing nav']
    const navRect = navElement.getBoundingClientRect()
    return [...document.querySelectorAll('main a, main button, main input, main select, main textarea')]
      .filter((el) => {
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && rect.bottom > navRect.top && rect.top < navRect.bottom
      })
      .map((el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\\s+/g, ' ').slice(0, 80))
  })
  if (missing.length > 0) throw new Error('Nav mismatch. Got [' + labels.join(', ') + '] missing [' + missing.join(', ') + ']')
  if (!bottomNavBox || !viewport || bottomNavBox.y < viewport.height * 0.72) throw new Error('Bottom nav is not fixed near viewport bottom')
  if (dimensions.scrollWidth > dimensions.clientWidth + 1) throw new Error('Horizontal overflow: ' + dimensions.scrollWidth + ' > ' + dimensions.clientWidth)
  if (overlapped.length > 0) throw new Error('Bottom nav overlaps controls: ' + overlapped.join(' | '))
  return { labels, viewport, navY: bottomNavBox.y, width: dimensions.clientWidth }
}"
```

Expected:

```text
Passes with labels: Chi tiêu, Phân tích, Gia đình, Tài khoản.
No horizontal overflow.
No overlapped interactive controls.
```

Repeat the smallest viewport pass:

```bash
playwright-cli resize 360 740
playwright-cli goto "$APP_URL/expenses"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/mobile-05-expenses-360x740.png
```

Expected:

```text
Expense page remains usable.
Search/filter row, floating add button, and bottom tabs do not overlap.
Long labels truncate or wrap cleanly.
```

### 3. Desktop Layout And Navigation Evidence

```bash
playwright-cli resize 1440 900
playwright-cli goto "$APP_URL/expenses"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/desktop-01-expenses.png
playwright-cli goto "$APP_URL/insights"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/desktop-02-insights.png
playwright-cli goto "$APP_URL/households"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/desktop-03-households.png
playwright-cli goto "$APP_URL/account"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/desktop-04-settings-or-account.png
```

Expected:

```text
Top nav is visible.
Mobile fixed bottom tab is hidden.
Content is centered and constrained, not dashboard-sprawl.
Active nav state matches the current route.
```

Desktop assertion:

```bash
playwright-cli run-code "async page => {
  const header = page.locator('header')
  await header.waitFor({ state: 'visible', timeout: 10000 })
  const topNav = header.getByRole('navigation', { name: 'Các mục ứng dụng' })
  const labels = (await topNav.getByRole('link').allInnerTexts()).map((s) => s.trim()).filter(Boolean)
  const fixedBottomCount = await page.locator('body > div.fixed nav[aria-label=\"Các mục ứng dụng\"]').count()
  const mainBox = await page.locator('main > div').boundingBox()
  if (fixedBottomCount > 0) throw new Error('Desktop rendered mobile fixed bottom nav')
  if (!mainBox || mainBox.width > 1100) throw new Error('Desktop content is too wide or missing: ' + JSON.stringify(mainBox))
  return { labels, contentWidth: mainBox.width }
}"
```

Expected:

```text
No fixed mobile bottom nav.
Content width is app-like and centered.
Labels match the accepted navigation vocabulary or are reported as mismatch.
```

### 4. Add Expense Flow And API Truth

```bash
playwright-cli resize 390 844
playwright-cli goto "$APP_URL/expenses"
playwright-cli run-code "async page => {
  const note = 'PreShip food ' + new Date().toISOString()
  await page.getByRole('button', { name: 'Mở thêm nhanh chi tiêu' }).click()
  await page.getByRole('heading', { name: 'Chọn danh mục' }).waitFor({ timeout: 10000 })
  await page.getByRole('button', { name: /Ăn uống/ }).click()
  await page.getByRole('heading', { name: 'Nhập thông tin' }).waitFor({ timeout: 10000 })
  await page.locator('input[inputmode=\"numeric\"]').fill('35')
  await page.getByRole('button', { name: 'Tiền mặt' }).click()
  await page.getByPlaceholder('Add a note...').fill(note)
  await page.getByRole('button', { name: 'Tiếp tục' }).click()
  await page.getByRole('heading', { name: 'Thiết lập thêm' }).waitFor({ timeout: 10000 })
  await page.getByText('Không thuộc gia đình').waitFor({ timeout: 10000 })
  await page.getByText('Không thuộc nhóm').waitFor({ timeout: 10000 })
  const createResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/expenses') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Hoàn thành' }).click()
  const response = await createResponsePromise
  const body = await response.json()
  if (!response.ok()) throw new Error('Create failed ' + response.status() + ' ' + JSON.stringify(body))
  const expense = body.data
  if (!expense?.id) throw new Error('Missing expense id: ' + JSON.stringify(body))
  if (expense.title !== note) throw new Error('Title mismatch: ' + expense.title)
  if (expense.amountMinor !== 35000) throw new Error('Amount mismatch: ' + expense.amountMinor)
  if (expense.categoryKey !== 'food') throw new Error('Category mismatch: ' + expense.categoryKey)
  if (expense.sourceKey !== 'cash') throw new Error('Source mismatch: ' + expense.sourceKey)
  if (expense.householdId !== null) throw new Error('Expected personal expense household null, got ' + expense.householdId)
  if (Array.isArray(expense.groupIds) && expense.groupIds.length !== 0) throw new Error('Expected no group ids, got ' + expense.groupIds.join(','))
  await page.getByText('Đã thêm chi tiêu thành công').waitFor({ timeout: 10000 })
  await page.evaluate((data) => localStorage.setItem('preShipExpense', JSON.stringify(data)), { id: expense.id, note })
  return { id: expense.id, note, amountMinor: expense.amountMinor }
}"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/mobile-06-after-expense-create.png
```

Expected:

```text
Drawer closes after submit.
Success toast appears.
Stored API response has amountMinor 35000, categoryKey food, sourceKey cash, householdId null, and no group IDs.
Screenshot shows the expense feed or post-submit state without visual overlap.
```

Feed search check:

```bash
playwright-cli run-code "async page => {
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('preShipExpense') || '{}'))
  if (!saved.note) throw new Error('Missing preShipExpense note')
  await page.goto((process.env.APP_URL || 'http://localhost:3000') + '/expenses')
  await page.getByLabel('expense feed search').fill(saved.note)
  await page.waitForTimeout(900)
  await page.getByText(saved.note).waitFor({ timeout: 10000 })
  return { found: saved.note }
}"
```

Expected:

```text
Expense row with the unique PreShip note is visible in the feed.
Summary totals should refresh for the filtered set.
```

API list, summary, and personal analytics consistency:

```bash
playwright-cli run-code "async page => {
  const apiBase = process.env.API_BASE_URL
  if (!apiBase) throw new Error('Set API_BASE_URL')
  const authStore = await page.evaluate(() => JSON.parse(localStorage.getItem('auth-store') || '{}'))
  const token = authStore.state?.accessToken
  if (!token) throw new Error('Missing access token in auth-store')
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('preShipExpense') || '{}'))
  if (!saved.id || !saved.note) throw new Error('Missing saved PreShip expense')
  const headers = { accept: 'application/json', authorization: 'Bearer ' + token }
  const query = encodeURIComponent(saved.note)
  const listRes = await fetch(apiBase + '/expenses?limit=10&query=' + query, { headers })
  const listBody = await listRes.json()
  if (!listRes.ok) throw new Error('List failed ' + listRes.status + ' ' + JSON.stringify(listBody))
  const item = listBody.data.items.find((expense) => expense.id === saved.id)
  if (!item) throw new Error('Created expense not found in list: ' + JSON.stringify(listBody.data.items))
  const summaryRes = await fetch(apiBase + '/expenses/summary?query=' + query, { headers })
  const summaryBody = await summaryRes.json()
  if (!summaryRes.ok) throw new Error('Summary failed ' + summaryRes.status + ' ' + JSON.stringify(summaryBody))
  if (summaryBody.data.expenseCount < 1) throw new Error('Summary expenseCount did not include created expense')
  if (summaryBody.data.totalSpendMinor < 35000) throw new Error('Summary totalSpendMinor too low: ' + summaryBody.data.totalSpendMinor)
  const period = new Date().toISOString().slice(0, 7)
  const analyticsRes = await fetch(apiBase + '/analytics/overview?period=' + period, { headers })
  const analyticsBody = await analyticsRes.json()
  if (!analyticsRes.ok) throw new Error('Analytics failed ' + analyticsRes.status + ' ' + JSON.stringify(analyticsBody))
  if (analyticsBody.data.totalSpendMinor < 35000) throw new Error('Personal analytics totalSpendMinor too low: ' + analyticsBody.data.totalSpendMinor)
  return {
    expenseId: item.id,
    listAmountMinor: item.amountMinor,
    summaryTotalSpendMinor: summaryBody.data.totalSpendMinor,
    analyticsTotalSpendMinor: analyticsBody.data.totalSpendMinor,
  }
}"
```

Expected:

```text
List includes the created expense.
Filtered summary count is >= 1 and totalSpendMinor is >= 35000.
Personal analytics totalSpendMinor is >= 35000 for the current period.
```

### 5. Household-Scoped Smoke

Create household through UI:

```bash
playwright-cli goto "$APP_URL/households"
playwright-cli run-code "async page => {
  const name = 'PreShip Household ' + new Date().toISOString()
  await page.getByRole('button', { name: 'Tạo gia đình' }).click()
  await page.getByRole('heading', { name: 'Tạo gia đình mới' }).waitFor({ timeout: 10000 })
  await page.getByLabel('Tên gia đình').fill(name)
  const createResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/households') && response.request().method() === 'POST',
  )
  await page.getByRole('dialog').getByRole('button', { name: 'Tạo gia đình' }).click()
  const response = await createResponsePromise
  const body = await response.json()
  if (!response.ok()) throw new Error('Household create failed ' + response.status() + ' ' + JSON.stringify(body))
  const household = body.data
  if (!household?.id) throw new Error('Missing household id: ' + JSON.stringify(body))
  if (household.name !== name) throw new Error('Household name mismatch: ' + household.name)
  await page.getByText(name).waitFor({ timeout: 10000 })
  await page.evaluate((data) => localStorage.setItem('preShipHousehold', JSON.stringify(data)), { id: household.id, name })
  return { id: household.id, name: household.name, role: household.role }
}"
playwright-cli screenshot --filename=.playwright-cli/pre-ship/mobile-07-after-household-create.png
```

Expected:

```text
Household card appears with the unique PreShip name.
Created household role is admin.
```

Create a household expense and assert household ID:

```bash
playwright-cli goto "$APP_URL/expenses"
playwright-cli run-code "async page => {
  const savedHousehold = await page.evaluate(() => JSON.parse(localStorage.getItem('preShipHousehold') || '{}'))
  if (!savedHousehold.id || !savedHousehold.name) throw new Error('Missing saved PreShip household')
  const note = 'PreShip household food ' + new Date().toISOString()
  await page.getByRole('button', { name: 'Mở thêm nhanh chi tiêu' }).click()
  await page.getByRole('heading', { name: 'Chọn danh mục' }).waitFor({ timeout: 10000 })
  await page.getByRole('button', { name: /Ăn uống/ }).click()
  await page.getByRole('heading', { name: 'Nhập thông tin' }).waitFor({ timeout: 10000 })
  await page.locator('input[inputmode=\"numeric\"]').fill('45')
  await page.getByRole('button', { name: 'Tiền mặt' }).click()
  await page.getByPlaceholder('Add a note...').fill(note)
  await page.getByRole('button', { name: 'Tiếp tục' }).click()
  await page.getByRole('heading', { name: 'Thiết lập thêm' }).waitFor({ timeout: 10000 })
  await page.locator('select').first().selectOption(savedHousehold.id)
  const createResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/expenses') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Hoàn thành' }).click()
  const response = await createResponsePromise
  const body = await response.json()
  if (!response.ok()) throw new Error('Household expense create failed ' + response.status() + ' ' + JSON.stringify(body))
  const expense = body.data
  if (expense.householdId !== savedHousehold.id) throw new Error('Household id mismatch: ' + expense.householdId + ' !== ' + savedHousehold.id)
  if (expense.amountMinor !== 45000) throw new Error('Amount mismatch: ' + expense.amountMinor)
  await page.evaluate((data) => localStorage.setItem('preShipHouseholdExpense', JSON.stringify(data)), { id: expense.id, note })
  return { id: expense.id, householdId: expense.householdId, amountMinor: expense.amountMinor }
}"
```

Expected:

```text
Created expense has the PreShip household ID and amountMinor 45000.
Household and personal axes remain explicit; household is selected only because the tester chose it.
```

### 6. Contextual Group And Budget Smoke

Run this only after a household exists. This step verifies contextual reachability and basic create behavior. It is not a deep budget-calculation audit.

```bash
playwright-cli goto "$APP_URL/account"
playwright-cli run-code "async page => {
  await page.getByRole('link', { name: /Quản lý Nhóm/ }).waitFor({ timeout: 10000 })
  await page.getByRole('link', { name: /Thiết lập Ngân sách/ }).waitFor({ timeout: 10000 })
  return {
    hasGroupsLink: true,
    hasBudgetsLink: true,
    currentUrl: page.url(),
  }
}"
```

Expected:

```text
Groups and budgets are reachable from the settings/account management surface.
They are not extra top-level mobile tabs.
```

Optional group create:

```bash
playwright-cli goto "$APP_URL/groups"
playwright-cli run-code "async page => {
  const name = 'PreShip Group ' + new Date().toISOString()
  await page.getByRole('button', { name: 'Tạo nhóm mới' }).click()
  await page.getByRole('heading', { name: 'Tạo nhóm chi tiêu' }).waitFor({ timeout: 10000 })
  await page.getByLabel('Tên nhóm').fill(name)
  await page.getByLabel('Ngân sách dự kiến').fill('200000')
  const createResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/groups') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Tạo nhóm' }).click()
  const response = await createResponsePromise
  const body = await response.json()
  if (!response.ok()) throw new Error('Group create failed ' + response.status() + ' ' + JSON.stringify(body))
  if (body.data.name !== name) throw new Error('Group name mismatch: ' + body.data.name)
  await page.getByText(name).waitFor({ timeout: 10000 })
  await page.evaluate((data) => localStorage.setItem('preShipGroup', JSON.stringify(data)), { id: body.data.id, name })
  return { id: body.data.id, name: body.data.name, eventBudgetMinor: body.data.eventBudgetMinor }
}"
```

Expected:

```text
Group appears in the list with the unique PreShip name.
If the Create button is missing, record whether the account has no household context or lacks permission.
```

Optional budget create:

```bash
playwright-cli goto "$APP_URL/budgets"
playwright-cli run-code "async page => {
  const period = new Date().toISOString().slice(0, 7)
  await page.getByRole('button', { name: 'Tạo ngân sách' }).click()
  await page.getByRole('heading', { name: 'Tạo ngân sách mới' }).waitFor({ timeout: 10000 })
  await page.getByLabel('Kỳ ngân sách').fill(period)
  await page.getByLabel('Tổng ngân sách').fill('500000')
  const createResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/budgets') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Tạo' }).click()
  const response = await createResponsePromise
  const body = await response.json()
  if (response.status() === 409) return { skipped: 'Budget already exists for ' + period }
  if (!response.ok()) throw new Error('Budget create failed ' + response.status() + ' ' + JSON.stringify(body))
  if (body.data.period !== period) throw new Error('Budget period mismatch: ' + body.data.period)
  await page.evaluate((data) => localStorage.setItem('preShipBudget', JSON.stringify(data)), { id: body.data.id, period })
  return { id: body.data.id, period: body.data.period, totalLimitMinor: body.data.totalLimitMinor }
}"
```

Expected:

```text
Budget create succeeds, or a 409 duplicate-period response is recorded as environment setup rather than a product failure.
Budget status panel should load without blocking error.
```

### 7. Console, Network, And Screenshot Evidence

```bash
playwright-cli console error
playwright-cli requests
playwright-cli snapshot --filename=.playwright-cli/pre-ship/final-snapshot.yml
```

Expected:

```text
No uncaught runtime errors.
No unexpected 4xx/5xx requests for the tested happy paths.
Allowed 409 only for duplicate budget period in optional budget smoke.
```

### 8. Cleanup

Delete created expenses and archive the test household when safe:

```bash
playwright-cli run-code "async page => {
  const apiBase = process.env.API_BASE_URL
  if (!apiBase) throw new Error('Set API_BASE_URL')
  const authStore = await page.evaluate(() => JSON.parse(localStorage.getItem('auth-store') || '{}'))
  const token = authStore.state?.accessToken
  if (!token) throw new Error('Missing access token in auth-store')
  const headers = { accept: 'application/json', authorization: 'Bearer ' + token }
  const personalExpense = await page.evaluate(() => JSON.parse(localStorage.getItem('preShipExpense') || '{}'))
  const householdExpense = await page.evaluate(() => JSON.parse(localStorage.getItem('preShipHouseholdExpense') || '{}'))
  const household = await page.evaluate(() => JSON.parse(localStorage.getItem('preShipHousehold') || '{}'))
  const results = []
  for (const expense of [personalExpense, householdExpense]) {
    if (!expense.id) continue
    const res = await fetch(apiBase + '/expenses/' + expense.id, { method: 'DELETE', headers })
    const body = await res.json().catch(() => null)
    results.push({ type: 'expense', id: expense.id, status: res.status, body })
  }
  if (household.id) {
    const res = await fetch(apiBase + '/households/' + household.id, { method: 'DELETE', headers })
    const body = await res.json().catch(() => null)
    results.push({ type: 'household', id: household.id, status: res.status, body })
  }
  return results
}"
```

Expected:

```text
Expense cleanup returns success or already-deleted/not-found status that is recorded.
Household cleanup returns success only when the account is allowed to archive that household.
Any cleanup failure is recorded with status and response body.
```

## Validation and Acceptance

### Must-Pass Product Checks

| Area | Test | Expected |
|---|---|---|
| Auth | Sign in with test account | Redirects to `/expenses`; protected page loads |
| Session | Reload protected page | Still authenticated; no forced re-login |
| Mobile nav | `390x844` protected pages | Fixed bottom nav, one nav model, no overlap |
| Desktop nav | `1440x900` protected pages | Top nav visible, bottom nav hidden |
| Navigation vocabulary | Top-level tabs | `Chi tiêu`, `Phân tích`, `Gia đình`, `Tài khoản` |
| Add expense | Personal expense amount `35` | API response `amountMinor: 35000` |
| Add expense defaults | No household/group selected | `householdId: null`, no group IDs |
| Expense feed | Search unique note | Created expense appears |
| Expense summary | Filtered summary by note | Count >= 1, total >= created amount |
| Analytics | Personal analytics current period | Total spend includes created personal expense |
| Household | Create household | New household card appears, current user admin |
| Household expense | Select created household in step 3 | API response includes created `householdId` |
| Runtime health | Console/network | No uncaught errors or unexpected failed happy-path requests |

### Layout Review Acceptance

Use `.agents/skills/ui-ux-review/output-format.md`. The future layout-review agent must produce:

- Overall score out of 10.
- Verdict: `Ship`, `Ship with minor fixes`, `Needs revision`, or `Redesign required`.
- Top issues with severity, evidence, impact, and recommended fix.
- Scores for all ten rubric categories.
- Screenshot references for each issue.

Layout can ship when:

- No Critical issues.
- No High issues.
- Mobile score >= 8/10.
- Navigation score >= 8/10.
- Accessibility score >= 8/10.
- State handling score >= 7/10.
- Screenshots show no bottom-nav/FAB/sheet footer overlap.
- Finance values are labeled enough that users know whether each amount is spending, balance, budget, or remaining amount.

### Data Review Acceptance

Data can ship when:

- Created API records match the UI-entered values.
- VND thousand shortcut is correct: `35` -> `35000`.
- Expense appears in feed/search after create.
- Summary and analytics include the new amount.
- Household-scoped expense keeps the selected household ID.
- Permission or environment failures are classified correctly:
  - missing household setup is environment gap
  - unauthorized mutation on allowed role is product/backend failure
  - duplicate budget period is setup collision unless it blocks normal budget review

## Subagent Execution Model

Use `subagent-driven-development` only for execution, not for plan creation. Safe future lanes:

- Lane A: Auth/session/nav smoke.
- Lane B: Mobile and desktop screenshot capture plus UI/UX review.
- Lane C: Expense personal data flow and API consistency.
- Lane D: Household/group/budget contextual smoke.

Parallelism rules:

- Lane A runs first because it creates auth state.
- Lane B can run in parallel after auth state exists because it is mostly read-only.
- Lane C and Lane D should not mutate the same account at the same time unless each uses unique `PreShip` prefixes and the orchestrator owns cleanup.
- Final report and cleanup are sequential.

Each lane reports:

```text
Status: PASS / FAIL / BLOCKED
Commands run:
Artifacts:
Expected:
Actual:
Issues:
Cleanup done:
```

## Idempotence & Recovery

- `playwright-cli delete-data` is safe for the Playwright profile but signs out that browser session.
- Screenshots can be overwritten by rerunning the same commands.
- `PreShip` expense and household names are timestamped to avoid collisions.
- Cleanup is best effort. If cleanup fails, record the IDs from `localStorage` and API response status.
- If login fails, stop and verify Firebase credentials and API auth exchange before running downstream tests.
- If the API health check fails, do not classify UI data failures until the target environment is confirmed healthy.
- If layout assertions fail because nav label is unexpected, record the actual labels and treat as product issue.

## Artifacts and Notes

Expected evidence paths:

```text
.playwright-cli/pre-ship/01-after-sign-in.yml
.playwright-cli/pre-ship/auth.json
.playwright-cli/pre-ship/mobile-01-expenses.png
.playwright-cli/pre-ship/mobile-02-insights.png
.playwright-cli/pre-ship/mobile-03-households.png
.playwright-cli/pre-ship/mobile-04-settings-or-account.png
.playwright-cli/pre-ship/mobile-05-expenses-360x740.png
.playwright-cli/pre-ship/mobile-06-after-expense-create.png
.playwright-cli/pre-ship/mobile-07-after-household-create.png
.playwright-cli/pre-ship/desktop-01-expenses.png
.playwright-cli/pre-ship/desktop-02-insights.png
.playwright-cli/pre-ship/desktop-03-households.png
.playwright-cli/pre-ship/desktop-04-settings-or-account.png
.playwright-cli/pre-ship/final-snapshot.yml
```

Do not commit `.playwright-cli/pre-ship/auth.json`.

## Interfaces & Dependencies

- `playwright-cli` is the browser automation interface.
- `curl` is used only for API health preflight.
- `APP_URL` points to the Next.js web app under test.
- `API_BASE_URL` points to the worker API base path without a trailing slash.
- `E2E_EMAIL` and `E2E_PASSWORD` hold runtime-only test credentials.
- The browser reads `auth-store` from local storage to call API endpoints directly for verification.
- No new npm dependency is required.
