# Profile Settings UI Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the current settings hub UI issues around misleading shortcuts, multi-household clarity, stale household fetch behavior, retryable error handling, and harness status consistency.

**Architecture:** Keep the change surgical. Update the existing `ProfileSettingsPage` instead of introducing new abstractions, reuse the existing household detail route as the only truthful household destination, and localize the household error state in the page instead of broadening store responsibilities. Keep the harness fix data-only.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Testing Library, project i18n JSON.

---

### Task 1: Lock in the intended UI behavior with tests

**Files:**
- Modify: `apps/web/src/views/app/profile-settings-page.test.tsx`
- Test: `apps/web/src/views/app/profile-settings-page.test.tsx`

- [ ] **Step 1: Write failing tests for the reviewed issues**

Add assertions for:

```tsx
it('refetches households on mount even when a stale store error exists', () => {
  householdStoreState.error = 'Some older household error'

  render(<ProfileSettingsPage />)

  expect(fetchHouseholds).toHaveBeenCalledTimes(1)
})

it('renders household memberships as links to the household detail page', () => {
  householdStoreState.households = [
    { id: 'household-1', name: 'Family One', role: 'member' },
  ]

  render(<ProfileSettingsPage />)

  expect(screen.getByRole('link', { name: 'Family One' })).toHaveAttribute(
    'href',
    `${PATHS.HOUSEHOLDS}/household-1`,
  )
})

it('labels each shortcut group with the household name and only shows truthful actions', () => {
  householdStoreState.households = [
    { id: 'household-1', name: 'Family One', role: 'member' },
    { id: 'household-2', name: 'Family Two', role: 'admin' },
  ]

  render(<ProfileSettingsPage />)

  expect(screen.getAllByText(t('app.settings.shortcuts.actions.viewHousehold'))).toHaveLength(2)
  expect(screen.queryByRole('link', { name: t('app.settings.shortcuts.actions.manageMembers') })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: t('app.settings.shortcuts.actions.openHouseholdSettings') })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: t('app.settings.shortcuts.actions.inviteMembers') })).not.toBeInTheDocument()
})

it('renders translated household load failure with retry affordance and alert role', () => {
  householdStoreState.error = 'Load households failed'

  render(<ProfileSettingsPage />)

  expect(screen.getByRole('alert')).toHaveTextContent(
    t('app.settings.memberships.errors.loadFailed'),
  )
  expect(screen.getByRole('button', { name: t('app.settings.memberships.actions.retry') })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the page test to verify it fails**

Run: `pnpm --filter web test -- --run src/views/app/profile-settings-page.test.tsx`

Expected: FAIL because current UI still renders static membership rows, misleading shortcut labels, and raw non-retryable household errors.

### Task 2: Implement the minimal page and i18n changes

**Files:**
- Modify: `apps/web/src/views/app/profile-settings-page.tsx`
- Modify: `apps/web/src/lib/i18n/locales/vi.json`

- [ ] **Step 1: Update the page to match the tested behavior**

Implement these exact changes:

```tsx
const shouldFetchHouseholds = households.length === 0 && !isHouseholdsLoading

// membership rows become links
<Link href={`${PATHS.HOUSEHOLDS}/${household.id}`}>...</Link>

// error state uses translated copy + retry button + role alert
<div className='flex flex-col gap-3'>
  <p role='alert' className='text-sm text-destructive'>
    {t('app.settings.memberships.errors.loadFailed')}
  </p>
  <Button variant='outline' onClick={() => void householdActions.fetchHouseholds()}>
    {t('app.settings.memberships.actions.retry')}
  </Button>
</div>

// shortcuts become one truthful per-household link with visible household label
<div className='flex flex-col gap-2'>
  <p className='text-sm font-medium'>{household.name}</p>
  <Link href={`${PATHS.HOUSEHOLDS}/${household.id}`}>
    {t('app.settings.shortcuts.actions.viewHousehold')}
  </Link>
</div>
```

- [ ] **Step 2: Add only the needed translation keys and remove the dead one**

Update the locale with:

```json
"memberships": {
  "actions": {
    "retry": "Thử lại"
  },
  "errors": {
    "loadFailed": "Không thể tải thông tin gia đình lúc này. Vui lòng thử lại."
  }
}
```

and delete the unused `app.settings.shortcuts.actions.leaveHousehold` key.

- [ ] **Step 3: Run the page test to verify it passes**

Run: `pnpm --filter web test -- --run src/views/app/profile-settings-page.test.tsx`

Expected: PASS.

### Task 3: Sync harness metadata

**Files:**
- Modify: `harness/feature_index.json`

- [ ] **Step 1: Apply the data-only harness fix**

Change:

```json
{
  "id": "feat-041",
  "name": "Profile/settings hub expansion for membership overview and user preferences",
  "status": "done"
}
```

- [ ] **Step 2: Sanity-check the file content**

Run: `python3 -m json.tool harness/feature_index.json >/dev/null`

Expected: exit 0.

### Task 4: Verify the targeted scope

**Files:**
- Modify: `apps/web/src/views/app/profile-settings-page.tsx`
- Modify: `apps/web/src/views/app/profile-settings-page.test.tsx`
- Modify: `apps/web/src/lib/i18n/locales/vi.json`
- Modify: `harness/feature_index.json`

- [ ] **Step 1: Run targeted verification**

Run:

```bash
pnpm --filter web test -- --run src/views/app/profile-settings-page.test.tsx && pnpm --filter web typecheck && pnpm --filter web lint
```

Expected: page test passes, typecheck exits 0, lint exits 0 or only repeats documented pre-existing warnings.

- [ ] **Step 2: Review changed-scope blast radius before any commit**

Run: GitNexus `detect_changes(scope: "all")`

Expected: only the settings page, its test, i18n locale, and harness metadata appear as affected changes.
