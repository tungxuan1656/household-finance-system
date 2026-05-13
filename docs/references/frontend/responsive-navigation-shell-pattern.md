# Responsive Navigation Shell Pattern

One route model. Two nav surfaces.

## Contract

- Desktop/tablet `>= 768px`: persistent left sidebar.
- Mobile `< 768px`: fixed bottom tab bar.
- Both surfaces share route constants and active-state logic.
- Shell reserves mobile bottom space so tabs do not cover content.
- Safe-area inset handled for notch devices.

## Route Shape

```text
public route -> protected guard -> shell layout -> child route outlet
```

- Public routes stay outside shell.
- Protected routes render inside `AppLayout` or route-group layout.
- Shell composes sidebar, bottom tabs, global sheets/dialogs, and page outlet.

## Nav Model

- `PATHS`: route URLs.
- `APP_MENU_ITEMS`: desktop/sidebar items.
- `BOTTOM_TAB_ITEMS`: mobile tab items.
- Item fields: `label`, `path`, `icon` token.
- Home active match: exact.
- Other active match: `pathname.startsWith(path)`.

## Layout Rules

- Use `useIsMobile` or CSS breakpoint at `768px`.
- Sidebar hidden on mobile, visible on desktop.
- Bottom tabs visible on mobile, hidden on desktop.
- Bottom tabs render fixed to viewport bottom.
- Prefer `createPortal(..., document.body)` for bottom tabs to avoid clipping.
- Main content uses `min-h-screen` and enough mobile bottom padding.
- Use `env(safe-area-inset-bottom)` via utility such as `pb-safe`.

## Layer Order

1. Page content
2. Sidebar shell
3. Bottom tab
4. Sheets/dialogs
5. Toasts/global overlays

## Cross-Surface Actions

- Desktop sidebar footer may show primary action.
- Mobile must expose same action through mobile-friendly entry point.
- Shared action opens global sheet/modal mounted near shell root.
- Store shared UI state centrally when many components trigger it.

## File Map

```text
apps/web/src/app/**/layout.tsx
apps/web/src/components/layout/app-layout.tsx
apps/web/src/components/layout/app-sidebar.tsx
apps/web/src/components/layout/bottom-tab.tsx
apps/web/src/components/layout/app-back.tsx
apps/web/src/components/layout/scroll-to-top.tsx
apps/web/src/components/ui/sidebar.tsx
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

- [ ] Sidebar visible at `>= 768px`
- [ ] Bottom tabs visible at `< 768px`
- [ ] Content not covered by fixed tabs
- [ ] Active item correct for root and nested routes
- [ ] Tabs not clipped by overflow container
- [ ] Safe area correct on iPhone/notch devices
- [ ] Modals/sheets appear above nav
- [ ] Sidebar and tabs use same route source

## Pitfalls

- Tabs cover CTA -> add shell-level bottom padding.
- Nested route inactive -> use prefix match except home.
- Tabs clipped -> portal to `document.body`.
- Sidebar/tab drift -> centralize constants.
