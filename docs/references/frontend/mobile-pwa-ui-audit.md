# Mobile PWA UI Audit

Current target: move from responsive website to native-feeling mobile PWA.

## Strengths

- Clean fintech visual direction.
- Consistent typography and card language.
- Navigation is understandable.
- Add-expense flow is close to native app UX.

## Root Issues

- Mobile shell not strict enough.
- iOS PWA viewport/safe-area needs hardening.
- Some overlays use desktop dialog strategy on mobile.
- Bottom spacing is hardcoded.
- Keyboard can cover form CTAs.
- Some cards expose too many horizontal actions.

## Priority

Critical:

- fixed bottom nav correctness
- dialog overflow on mobile
- keyboard overlap
- safe-area correctness

High:

- width overflow
- header height
- drawer bottom gaps

Medium:

- excessive spacing
- action overflow
- weak empty states

## Refactor Order

1. Foundation: safe-area, `dvh`, shell, overflow.
2. Navigation: fixed bottom tabs, sticky header, FAB position.
3. Overlay system: dialog to drawer on mobile, sticky footer, internal scroll.
4. Forms: keyboard handling, native date input, compact spacing.
5. Polish: animation, empty states, motion, haptic feel.

## Screen Notes

Landing:

- Add safe top.
- Compact hero spacing and title scale.

Expenses:

- Bottom tab fixed.
- Content bottom padding includes safe area.
- FAB sits above tabs.
- Advanced filter is bottom drawer on mobile.

Insights:

- Compact header.
- Compact filter chips.
- Reduce chart-card vertical footprint.
- Reserve bottom scroll padding.

Households:

- Reduce card spacing.
- Empty state needs clear create CTA.
- Avoid bottom nav overlap.

Account:

- Reduce vertical spacing.
- Compact settings list.
- Safe bottom spacing.

Groups:

- Replace 3 horizontal actions with primary action plus overflow menu.
- Create/edit group uses drawer on mobile, dialog on desktop.
- Group form footer stays sticky.

Group Detail:

- Compact cards.
- Empty state should expose add-expense CTA.

Add Expense:

- Keep stepper/category picker pattern.
- Drawer uses `90dvh` max height.
- Content scrolls internally.
- Footer CTA is sticky and safe-area aware.

Category Picker:

- Compact grid.
- Sticky safe-area footer.

## Done Criteria

- Native iOS feeling.
- Stable keyboard behavior.
- Safe-area correct.
- No horizontal overflow.
- Smooth scrolling.
- Consistent shell layout.
- Compact mobile density.
- Drawer-first mobile UX.
