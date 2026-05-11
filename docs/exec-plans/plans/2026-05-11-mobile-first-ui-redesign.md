# ExecPlan: Mobile-First UI Redesign — Shell + Pages

## Purpose / Big Picture

Refactor toàn bộ web UI theo hướng **mobile-first**, sử dụng design system đã định nghĩa (`design-system.md`, `ui-implementation-rules.md`), với shell/layout hoàn hảo trước, sau đó từng page với visual polish cao.

**User-visible outcome:** Ứng dụng web nhìn đẹp, clean, nhất quán trên mobile. Desktop experience cũng premium. Navigation rõ ràng, typography dễ đọc, spacing consistent, hover states mượt.

---

## Scope

**In-scope:**
- Layout shell: `main-layout.tsx`, `app-sidebar.tsx`, `bottom-tab.tsx`
- Shared components: `PageShell`, `PageSection` (create if not exist)
- All app pages under `apps/web/src/views/app/`
- Auth pages: `sign-in-page.tsx`, `sign-up-page.tsx` (liquid glass style preserved)
- Public pages: `landing-page.tsx`

**Out-of-scope:**
- Backend changes
- Business logic / data flow changes
- New feature functionality
- Code logic refactor (only visual/styling)

---

## Non-negotiable Requirements

1. **Mobile-first** — Base styles for mobile, override with `md:` for desktop
2. **Semantic tokens only** — `bg-primary`, `text-muted-foreground`, never raw values
3. **shadcn components first** — Use installed components, not custom markup
4. **Touch targets ≥ 44px** — Buttons `h-12 min-w-12`, list items `h-14`
5. **No layout shift on hover** — Color/shadow transitions only, no scale transforms
6. **Consistent spacing** — 4px base scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
7. **Typography hierarchy** — `text-xl md:text-2xl`, `font-heading`, `font-semibold`

---

## Design Philosophy — "Form Follows Function, Beautifully"

### Core Principle
**Không chỉ "làm đẹp" — mà là THINK THÔNG THIÚP về UI.**

Mỗi page/component cần được xem xét kỹ:
1. **Purpose first** — Đây là page/component để làm gì? User muốn đạt được gì?
2. **Information hierarchy** — Thông tin quan trọng nhất hiển thị ở đâu?
3. **User flow** — User đi qua page như thế nào? Tap/click path nào?
4. **Visual balance** — Bố cục có cân đối không? Có quá crowded hoặc quá trống?
5. **Responsive sanity** — Mobile view có practical không? Desktop view có professional không?

### Anti-"Just Make It Pretty" Approach
- ❌ Không chỉ thay màu, đổi font, rồi gọi là xong
- ❌ Không giữ nguyên layout cũ chỉ vì nó "vẫn hoạt động"
- ✅ Có thể **thay đổi cấu trúc component, sắp xếp lại layout, loại bỏ hoặc thêm elements** để đạt được UX tốt hơn
- ✅ Có thể **tách nhỏ components, gộp components, hoặc tạo components mới** nếu nó cải thiện maintainability và visual consistency
- ✅ Mỗi quyết định design phải có **lý do rõ ràng** dựa trên use case

### UX Decisions Must Answer
- Tại sao button này ở vị trí này?
- Đây có phải là thông tin user cần thấy trước không?
- Mobile user có thể hoàn thành task chính chỉ với 1 hand không?
- Khi nào thì nên dùng list vs grid vs cards?
- Empty state có helpful không, hay chỉ là placeholders?
- Loading state có informative không, hay chỉ là spinners?

---

## Context and Orientation

### Key Files

**Layout:**
- `apps/web/src/components/layouts/main-layout.tsx` — Desktop/mobile wrapper
- `apps/web/src/components/layouts/app-sidebar.tsx` — Desktop sidebar (240-280px)
- `apps/web/src/components/layouts/bottom-tab.tsx` — Mobile bottom navigation

**Design tokens:**
- `apps/web/src/index.css` — All CSS variables (colors, radius, spacing, animation)

**Design docs (already complete):**
- `docs/design-docs/design-system.md` — Tokens definition
- `docs/design-docs/ui-implementation-rules.md` — Implementation rules

**Pages to refactor (with design questions to answer):**
- `overview-page.tsx` + sub-components — Dashboard, critical info hierarchy
- `expenses-page.tsx` + components — List/filter UX, search vs browse
- `budgets-page.tsx` + components — Status visibility, progress representation
- `insights-page.tsx` + sub-components — Data presentation, chart choices
- `households-page.tsx` + components — Card vs list, action prominence
- `profile-settings-page.tsx` — Settings organization, shortcuts

---

## Progress

### Phase 1: Shell/Layout Polish
- [ ] Audit and fix `main-layout.tsx` — padding, background, max-width, scroll behavior
- [ ] Audit and fix `app-sidebar.tsx` — visual polish, hover states, active indicator, avatar section
- [ ] Audit and fix `bottom-tab.tsx` — height, touch targets, active state, icon clarity
- [ ] Create `PageShell` + `PageSection` components if needed — consistent page structure

### Phase 2: Home Page (Overview) — THINK UX ✅ COMPLETE
- [x] Re-examine `overview-page.tsx` — page purpose, information hierarchy
- [x] Re-examine `overview-header.tsx` — welcome message, first impression
- [x] Re-examine `overview-summary-section.tsx` — stats importance, action placement
- [x] Re-examine `overview-households-section.tsx` — card design, quick actions
- [x] Re-examine `overview-budget-card.tsx`, `overview-next-steps-card.tsx` — card composition, CTA

### Phase 3: Expenses Page — THINK UX
- [ ] Re-examine `expenses-page.tsx` — primary user goal (find? add? browse?)
- [ ] Re-examine expense components — feed vs list vs grid, filter UX, search behavior

### Phase 4: Budgets Page — THINK UX
- [ ] Re-examine `budgets-page.tsx` — status visibility, progress representation
- [ ] Re-examine budget components — warning thresholds, action clarity

### Phase 5: Insights Page — THINK UX
- [ ] Re-examine `insights-page.tsx` — chart choices, data density vs simplicity
- [ ] Re-examine insights components — panel hierarchy, comparison UX

### Phase 6: Households Page — THINK UX
- [ ] Re-examine `households-page.tsx` — card design, create flow prominence
- [ ] Re-examine household components — member visibility, role indication

### Phase 7: Profile/Settings Page — THINK UX
- [ ] Re-examine `profile-settings-page.tsx` — settings organization, shortcut utility

### Phase 8: Auth Pages (preserve liquid glass)
- [ ] Review `sign-in-page.tsx` — ensure liquid glass style intact
- [ ] Review `sign-up-page.tsx` — ensure liquid glass style intact

### Phase 9: Landing Page
- [ ] Review `landing-page.tsx` — public marketing page polish

---

## Decision Log

- **Decision:** Use approach 3 (Quick wins first) — Fix shell/layout before pages
  **Rationale:** Shell is reused everywhere; fixing it first gives immediate visual improvement and establishes foundation
  **Date/Author:** 2026-05-11

- **Decision:** Preserve Auth liquid glass style
  **Rationale:** Auth pages (feat-047) already have premium liquid glass design; don't change
  **Date/Author:** 2026-05-11

- **Decision:** Deep refactor — Component restructuring allowed
  **Rationale:** Surface-level polish won't achieve "beautiful, clean mobile-first". Must be willing to change structure, not just styles.
  **Date/Author:** 2026-05-11

---

## Plan of Work (Narrative)

### Phase 1: Shell/Layout Polish

**1.1 Fix `main-layout.tsx`**

Current state: Uses `grid-cols-[240px_minmax(0,1fr)]` with manual responsive.
Target: Clean mobile-first with proper padding scale, max-width container, no horizontal overflow.

Changes:
- Remove `rounded-none border-x` from main content area (too generic)
- Use `p-4 md:p-6 lg:p-8` for content padding
- Add `max-w-5xl mx-auto` on lg+ for content constraint
- Ensure `pb-24 md:pb-8` for bottom tab spacing

**1.2 Fix `app-sidebar.tsx`**

Current state: Basic sidebar with links.
Target: Premium desktop navigation with clear active states, subtle shadows, proper spacing.

Changes:
- Add `shadow-sm` to sidebar container
- Improve active state: `bg-primary text-primary-foreground` with subtle left border or indicator
- Add hover transitions: `transition-colors duration-150`
- Refine spacing: `gap-2` for nav items, `p-4` container padding
- Add user avatar section at bottom with proper styling

**1.3 Fix `bottom-tab.tsx`**

Current state: Basic fixed bottom nav.
Target: Polished mobile navigation with clear active states, proper height (64px + safe area).

Changes:
- Ensure `h-16` (64px) height
- Add `min-h-11` touch target for each tab
- Refine active state: `text-primary` (slate color, not generic blue)
- Add subtle icon animation on active (optional)
- Ensure `pb-safe` for iOS safe area

**1.4 Create PageShell + PageSection (if not exist)**

Check if these exist. If not, create:
- `PageShell` — wraps page with proper header spacing, scroll container
- `PageSection` — `default | card | stats | list` variants for content grouping

---

### Phase 2: Home Page (Overview) — Visual Refactor with UX Thinking

**2.1 Design Questions to Answer First:**

- What is the PRIMARY thing user wants to see on dashboard? (Spending summary? Budget status? Household activity?)
- Is 3 stat cards too much information at once, or just right?
- Where should "Add Expense" CTA live — top or bottom?
- Should households section be collapsed by default if user has many?

**2.2 `overview-header.tsx` — First Impression Matters**

Current: Badge + Title + Description + Signed in as...
Target: Warm welcome that sets context without overwhelming.

```tsx
// Target: Personal, warm, not info-dumping
<header className='space-y-2'>
  <Badge variant='outline' className='text-xs'>Dashboard</Badge>
  <h1 className='font-heading text-xl md:text-2xl tracking-tight'>
    Welcome back, {name ?? "Family"}
  </h1>
  <p className='text-sm text-muted-foreground'>
    Here's your financial overview
  </p>
</header>
```

**2.3 `overview-summary-section.tsx` — Stats with Purpose**

Questions:
- Do users need ALL 3 stats (total spend, expense count, household count) in one row?
- Or should "total spend" be hero number with others secondary?
- What does "expense count" tell us that "total spend" doesn't?

Design decision: 3-card grid works, but consider:
- Total spend = HERO (largest, most important)
- Expense count = supporting
- Household count = context (only 1 household most common)

**2.4 `overview-budget-card.tsx` — Action-Oriented**

Questions:
- When budget is exceeded, how visible is the warning?
- Can user fix the situation directly from this card?
- Is "Setup Budget" CTA prominent enough for users without budgets?

---

### Phase 3-7: Remaining Pages

Each page requires design thinking before styling:

**Expenses Page:**
- Primary action: ADD EXPENSE or FIND EXPENSE?
- Filter UX: Collapsible on mobile? Always visible?
- List vs Grid: Are expenses visual enough for grid, or is list better for scanning?

**Budgets Page:**
- Status clarity: Can user instantly see if they're OK, WARNING, or EXCEEDED?
- Progress representation: Progress bar? Number? Both?
- Action flow: How many taps to create a budget vs edit one?

**Insights Page:**
- Chart density: Too many charts overwhelm mobile
- Panel priority: Overview most important, comparison secondary
- Period selector: Sticky? Inline?

**Households Page:**
- Card design: What info makes a household card useful?
- Quick actions: Invite vs View vs Settings — which is most common?
- Empty state: Create vs Join — what's the right CTA?

**Profile/Settings Page:**
- Organization: Account vs Memberships vs Shortcuts vs Profile — logical grouping?
- Shortcut utility: Are these shortcuts actually useful or just placeholders?

---

## Concrete Steps (Commands)

```bash
# 1. Verify baseline
./init.sh

# 2. Start with shell audit - check current state
# Edit main-layout.tsx, app-sidebar.tsx, bottom-tab.tsx

# 3. Design thinking per page (use @designer for complex pages)
# For each page, ask: What is the user trying to accomplish?

# 4. Implementation after design decisions
# Use @designer for UI/UX refinement on complex sections
# Use @fixer for implementation after design decisions

# 5. After each phase
pnpm lint:fix
pnpm --filter @app/web type-check
```

---

## Validation and Acceptance

### Visual Quality Checklist
- [ ] No horizontal scroll on mobile (375px viewport)
- [ ] All touch targets ≥ 44×44px
- [ ] Consistent `gap-4 md:gap-6` spacing
- [ ] Typography hierarchy: `text-sm text-base text-lg text-xl text-2xl`
- [ ] Cards use full composition (CardHeader/CardContent/CardFooter)
- [ ] Hover states: color/shadow transitions only, no layout shift
- [ ] Focus rings visible on all interactive elements

### UX Quality Checklist
- [ ] Each page answers: "What is the user trying to do here?"
- [ ] Primary actions are visible and accessible
- [ ] Secondary information doesn't compete with primary
- [ ] Empty states are helpful, not just "No data" messages
- [ ] Loading states show what we're loading, not just spinners
- [ ] Error states are actionable, not just error messages

### Technical Quality
- [ ] `pnpm lint:fix && pnpm --filter @app/web type-check` passes
- [ ] All components use shadcn where applicable
- [ ] All colors use semantic tokens
- [ ] No hardcoded spacing values (use Tailwind scale)

---

## Idempotence & Recovery

Steps are safe to re-run. No destructive operations. Backup by git commit before Phase 1.

---

## Artifacts and Notes

Design reference:
- `docs/design-docs/design-system.md` — Tokens
- `docs/design-docs/ui-implementation-rules.md` — Rules
- `feat-048.json` — Scope definition

Current layout baseline:
- Mobile: Bottom tab (64px) + content `pb-24`
- Desktop: Sidebar (240-280px) + main content grid

**Key UX Principles to Remember:**
1. Mobile users often do ONE thing at a time — don't overwhelm
2. Desktop users may do MULTIPLE things — support scanning
3. "Just one more tap" compounds — minimize taps for common actions
4. Visual hierarchy: Size, color, position all communicate importance
5. White space is not wasted space — it helps comprehension