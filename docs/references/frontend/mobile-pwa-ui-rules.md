# Mobile PWA UI Rules

Canonical rules for mobile-first PWA UI in `apps/web`.

## Goal

Build a native-feeling mobile PWA that works on:

- iOS Safari
- iOS standalone PWA
- Android Chrome PWA

Priority order:

1. iOS PWA compatibility.
2. Native-app feel.
3. One consistent shell.
4. Correct safe-area handling.
5. Stable scroll and keyboard behavior.

## Shell

Mobile pages must render inside one app shell:

```tsx
<div className='mobile-shell'>
  <header />
  <main />
  <bottom-tab />
</div>
```

Rules:

- Use `min-h-dvh`, not `min-h-screen`, `min-h-svh`, or `100vh`.
- Main content is the only page scroller.
- Body must not scroll horizontally.
- Desktop extends the mobile layout. Do not design desktop first.

## Viewport

Root layout must expose:

```tsx
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}
```

Never use:

- `height: 100vh`
- `min-height: 100vh`
- `h-screen`
- `min-h-screen`

Use:

- `h-dvh`
- `min-h-dvh`
- `max-h-[90dvh]`

## Safe Area

Rules:

- Mobile header: `padding-top: env(safe-area-inset-top)`.
- Fixed bottom UI: `padding-bottom: env(safe-area-inset-bottom)`.
- Content with bottom tabs: `padding-bottom: calc(96px + env(safe-area-inset-bottom))`.
- FAB above tabs: `bottom: calc(96px + env(safe-area-inset-bottom))`.

## Header

Mobile header:

- `sticky`
- `top: 0`
- 56-64px visible height
- safe-area aware
- backdrop blur
- compact title

Avoid oversized titles and large vertical padding.

## Bottom Tabs

Bottom tabs:

- fixed to viewport
- outside content flow
- portal to `document.body`
- inset left/right `0`
- bottom `0`
- traditional app tab bar shape
- backdrop blur
- light shadow

Content must reserve bottom space. Tabs must not scroll with the page.

## Drawers

Mobile form, filter, picker, and edit flows use bottom drawer first.

Drawer structure:

```text
Drawer
  Handle
  Header
  Scrollable content
  Sticky footer
```

Rules:

- Bottom sheet touches the viewport bottom.
- Top radius only: `24px 24px 0 0`.
- `max-height: 90dvh`.
- Internal content scrolls with `overflow-y-auto`.
- Use `overscroll-behavior: contain`.
- Footer is sticky and safe-area aware.

Desktop may use centered dialog. Mobile must not use centered dialog for long forms.

## Keyboard

Rules:

- Do not use fixed viewport heights based on `vh`.
- Keep form CTA visible with sticky footer.
- Keep input content inside a scrollable drawer/body area.
- Prefer native date input on mobile.

## Width And Overflow

Global:

```css
html,
body {
  overflow-x: hidden;
}
```

Component rules:

- Flex text containers need `min-w-0`.
- Long text uses `truncate`, `overflow-hidden`, or `text-ellipsis`.
- Card actions on mobile: max 2 horizontal actions.
- Use overflow menu for secondary actions.

## Spacing

Mobile:

- Container padding: `px-4`.
- Section gap: `gap-4` or `gap-5`.
- Card padding: `p-4` or `p-5`.
- Inputs: 48-52px high.

Avoid `px-6`, `px-8`, large hero spacing, and low-density settings lists on mobile.

## Empty States

Empty state should include:

- icon
- message
- CTA

Example:

```text
Chua co khoan chi nao.
[+ Them khoan chi]
```

## Anti-Patterns

Do not use:

- `100vh`
- desktop dialog on mobile
- fixed footer without safe-area
- horizontal overflow
- 3+ horizontal card actions
- hardcoded viewport heights
- excessive spacing
- nested scroll conflicts

## Acceptance

UI passes when:

- no horizontal overflow
- bottom tabs stay fixed
- drawer feels native
- header is compact
- CTA stays visible with keyboard
- iPhone safe areas are correct
- scrolling is smooth
- no layout jump on keyboard open
