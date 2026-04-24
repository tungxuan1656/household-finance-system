# Shadcn-First UI Web Guide

## Status

- Accepted
- Applies to: `apps/web`
- Owner: Frontend maintainers
- Last updated: 2026-04-24

## Decision Summary

This project adopts a strict shadcn-first approach for web UI:

- Use existing shadcn components as the default building blocks.
- Keep page-level UI declarative and composition-focused.
- Centralize visual change in base primitives and semantic tokens.

The goal is predictable consistency and low-cost theme/template changes.

## Mandatory Pre-Flight (Before Any UI Task)

Before designing, implementing, or reviewing UI, contributors must read:

1. `.agents/skills/shadcn/SKILL.md`
2. `.agents/skills/shadcn/rules/styling.md`
3. `.agents/skills/shadcn/rules/forms.md`
4. `.agents/skills/shadcn/rules/composition.md`

If a UI task does not follow these documents, it is non-compliant.

## Mandatory Build Rules

1. Use existing components first
- Check available shadcn components before creating custom markup.

2. Compose, do not reinvent primitives
- Import base UI from `@/components/ui/*`.
- Do not create wrapper replacements for base primitives (`Button`, `Input`, `Card`, `Dialog`, etc.).
- Shared feature components are allowed (`user-card`, `page-footer`, etc.), but they must compose shadcn primitives internally.

3. Variant-first styling
- Use `variant` and `size` APIs before adding styles.
- If a new visual style is needed globally, add/adjust variants in the primitive file under `apps/web/src/components/ui/*`.

4. `className` is for layout, not primitive restyling
- Allowed: layout classes such as `w-full`, `max-w-*`, `mx-auto`, `grid`, `flex`, `gap-*`, `mt-*`.
- Not allowed on primitives: overriding color, typography, spacing, radius, border, or control height with ad-hoc utility classes.

5. Semantic tokens only
- Use semantic colors (`primary`, `muted-foreground`, `destructive`, etc.).
- Do not use hard-coded state colors (`green-*`, `red-*`, `blue-*`, etc.).
- Do not add manual `dark:` color overrides for component state.

6. Shadcn composition and accessibility rules are required
- Forms must use `FieldGroup` + `Field` patterns.
- Overlays (`Dialog`, `Sheet`, `Drawer`) must include title components.
- Use full card composition where applicable: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

## How To Change UI Template Safely

When updating design template (for example card padding, button height, button/input font size):

1. Update the related base primitive in `apps/web/src/components/ui/*` (and/or semantic tokens).
2. Prefer changing existing `variant`/`size` contracts over page-level styling.
3. Validate representative screens in both themes.
4. Avoid per-page overrides unless there is a documented product exception.

## PR Compliance Checklist (UI)

- I read required shadcn skill/rule docs before implementation.
- UI is composed from existing shadcn primitives.
- I used variants/tokens, not hard-coded visual utilities.
- No primitive restyling via ad-hoc `className`.
- Form/composition/accessibility requirements are satisfied.

## Non-Compliance Policy

- Non-compliant UI should be revised before merge.
- Repeated violations should be converted into lint or review automation.
