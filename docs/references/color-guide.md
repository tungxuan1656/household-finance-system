# Color Guide (apps/web)

This guide is synchronized with `src/index.css`.

## 1) Source of truth

- Theme tokens are declared in `:root` and `.dark` in `src/index.css`.
- Tailwind semantic classes are mapped through `@theme inline`.
- Add or change color tokens in `src/index.css` first, then consume them in components.

## 2) Core semantic tokens

| Token                  | Light                        | Dark                         | Typical classes                             |
| ---------------------- | ---------------------------- | ---------------------------- | ------------------------------------------- |
| `background`           | `oklch(1 0 0)`               | `oklch(0.148 0.004 228.8)`   | `bg-background`                             |
| `foreground`           | `oklch(0.148 0.004 228.8)`   | `oklch(0.987 0.002 197.1)`   | `text-foreground`                           |
| `card`                 | `oklch(1 0 0)`               | `oklch(0.218 0.008 223.9)`   | `bg-card`                                   |
| `card-foreground`      | `oklch(0.148 0.004 228.8)`   | `oklch(0.987 0.002 197.1)`   | `text-card-foreground`                      |
| `popover`              | `oklch(1 0 0)`               | `oklch(0.218 0.008 223.9)`   | `bg-popover`                                |
| `popover-foreground`   | `oklch(0.148 0.004 228.8)`   | `oklch(0.987 0.002 197.1)`   | `text-popover-foreground`                   |
| `primary`              | `oklch(0.525 0.223 3.958)`   | `oklch(0.459 0.187 3.815)`   | `bg-primary`, `text-primary`                |
| `primary-foreground`   | `oklch(0.971 0.014 343.198)` | `oklch(0.971 0.014 343.198)` | `text-primary-foreground`                   |
| `secondary`            | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | `bg-secondary`, `text-secondary-foreground` |
| `secondary-foreground` | `oklch(0.21 0.006 285.885)`  | `oklch(0.985 0 0)`           | `text-secondary-foreground`                 |
| `muted`                | `oklch(0.963 0.002 197.1)`   | `oklch(0.275 0.011 216.9)`   | `bg-muted`, `text-muted-foreground`         |
| `muted-foreground`     | `oklch(0.56 0.021 213.5)`    | `oklch(0.723 0.014 214.4)`   | `text-muted-foreground`                     |
| `accent`               | `oklch(0.963 0.002 197.1)`   | `oklch(0.275 0.011 216.9)`   | `bg-accent`, `text-accent-foreground`       |
| `accent-foreground`    | `oklch(0.218 0.008 223.9)`   | `oklch(0.987 0.002 197.1)`   | `text-accent-foreground`                    |
| `destructive`          | `oklch(0.577 0.245 27.325)`  | `oklch(0.704 0.191 22.216)`  | `bg-destructive`, `text-destructive`        |
| `border`               | `oklch(0.925 0.005 214.3)`   | `oklch(1 0 0 / 10%)`         | `border-border`                             |
| `input`                | `oklch(0.925 0.005 214.3)`   | `oklch(1 0 0 / 15%)`         | `border-input`                              |
| `ring`                 | `oklch(0.723 0.014 214.4)`   | `oklch(0.56 0.021 213.5)`    | `ring-ring`                                 |

## 3) Chart tokens

Use these only for data visualizations:

- `chart-1: oklch(0.823 0.12 346.018)`
- `chart-2: oklch(0.656 0.241 354.308)`
- `chart-3: oklch(0.592 0.249 0.584)`
- `chart-4: oklch(0.525 0.223 3.958)`
- `chart-5: oklch(0.459 0.187 3.815)`

## 4) Sidebar tokens

Use these in sidebar-specific components:

- `sidebar`
- `sidebar-foreground`
- `sidebar-primary`
- `sidebar-primary-foreground`
- `sidebar-accent`
- `sidebar-accent-foreground`
- `sidebar-border`
- `sidebar-ring`

## 5) Recommended usage rules

- Use semantic classes (`bg-background`, `text-foreground`, `border-border`) instead of hardcoded color values.
- Keep high-contrast pairs together (`primary` + `primary-foreground`, `card` + `card-foreground`).
- Use `destructive` only for error/destructive states.
- Prefer opacity variants (for example `bg-primary/10`) over introducing ad-hoc new colors.

## 6) Tokens that are not defined

Do not use classes like `text-danger`, `bg-success`, `bg-info`, or any non-semantic custom token unless the token is first added to `src/index.css`.
