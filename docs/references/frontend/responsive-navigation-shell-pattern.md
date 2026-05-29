# Responsive Navigation Shell Pattern

One route model. One nav surface.

## Contract

- Desktop/tablet `>= 768px`: horizontal top navigation bar, full-width content.
- Mobile `< 768px`: fixed bottom tab bar.
- Both surfaces share route constants and active-state logic.
- Both surfaces represent the same four top-level tabs:
  - `Expense`
  - `Analysis`
  - `Household`
  - `Settings`
- Protected default entry should target the Expense surface.
- Shell reserves mobile bottom space so tabs do not cover content.
- Safe-area inset handled for notch devices.

## Route Shape

```text
public route -> protected guard -> shell layout -> child route outlet
```

- Public routes stay outside shell.
- Protected routes render inside `MainLayout` or route-group layout.
- Shell composes top nav, bottom tabs, global sheets/dialogs, and page outlet.
- Protected page content inside the shell should use the shared page-surface wrappers from `docs/references/frontend/protected-page-surface-pattern.md`.

## Nav Model

- `PATHS`: route URLs.
- `BOTTOM_TAB_ITEMS`: shared nav items for both top nav and bottom tabs.
- Item fields: `label`, `path`, `icon` token.
- Active match: `pathname === itemPath || pathname.startsWith(\`\${itemPath}/\`)`.
- Secondary routes such as household detail, budget management, group/event management, and add/edit flows stay contextual routes, not top-level tabs.

## Layout Rules

- Use `useIsMobile` or CSS breakpoint at `768px`.
- Top nav visible on desktop, hidden on mobile.
- Bottom tabs visible on mobile, hidden on desktop.
- Bottom tabs render fixed to viewport bottom.
- Prefer `createPortal(..., document.body)` for bottom tabs to avoid clipping.
- Main content uses `min-h-screen` and enough mobile bottom padding.
- Use `env(safe-area-inset-bottom)` via utility such as `pb-safe`.

## Layer Order

1. Page content
2. Top nav (desktop) / Bottom tab (mobile)
3. Sheets/dialogs
4. Toasts/global overlays

## Top Nav Structure (Desktop)

- Left: User avatar + display name + email
- Center: Navigation links (horizontal, centered)
- Right: Sign out button

## Cross-Surface Actions

- Desktop top nav footer may show primary action.
- Mobile must expose same action through mobile-friendly entry point.
- Shared action opens global sheet/modal mounted near shell root.
- Store shared UI state centrally when many components trigger it.
- For the current Yellow Finance direction, the shared primary action is the add-expense flow and should open from shell-level triggers into one bottom drawer / modal entry point.

## File Map

```text
apps/web/src/app/**/layout.tsx
apps/web/src/components/layouts/main-layout.tsx
apps/web/src/components/layouts/app-top-nav.tsx
apps/web/src/components/layouts/bottom-tab.tsx
apps/web/src/components/layouts/mobile-header.tsx
apps/web/src/components/shared/page/*
apps/web/src/hooks/shared/use-mobile.ts
apps/web/src/lib/constants/paths.ts
apps/web/src/lib/constants/navigation.ts
apps/web/src/app/globals.css
```

Use actual repo paths when names differ. Do not introduce a second shell convention.

## Accessibility

- Use semantic `a` / `button`.
- Icon-only controls need `aria-label`.
- Focus ring visible.
- Touch targets large enough on mobile.
- Inactive state contrast remains readable.

## QA Checklist

- [ ] Top nav visible at `>= 768px`
- [ ] Bottom tabs visible at `< 768px`
- [ ] Content not covered by fixed tabs
- [ ] Active item correct for root and nested routes
- [ ] Tabs not clipped by overflow container
- [ ] Safe area correct on iPhone/notch devices
- [ ] Modals/sheets appear above nav
- [ ] Top nav and tabs use same route source
- [ ] Shared page header/content/footer composition stays aligned on mobile and desktop

## Pitfalls

- Tabs cover CTA -> add shell-level bottom padding.
- Nested route inactive -> use prefix match except home.
- Tabs clipped -> portal to `document.body`.
- Nav drift -> centralize constants.