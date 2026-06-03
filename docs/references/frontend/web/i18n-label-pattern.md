# I18n Label Pattern

## Rules

- All user-facing labels/text must use i18n.
- Do not hardcode text in components/pages.
- Strings live in JSON locale files.
- Keys use nested `x.y.z` paths.
- Form validation/error messages must use i18n keys too.

## Paths

```txt
src/
  lib/
    i18n/
      index.ts
      locales/
        vi.json
```

- i18n entry and locale files live in `apps/web/src/lib/i18n`.

## Key naming

- Keys must be semantic for the screen/feature.
- Use nested keys like `common.actions.save`, `auth.login.title`, `auth.login.form.email.label`.

## Usage

- Use `t('auth.login.title')`.
- Do not hardcode user-facing strings in JSX.
- Do not embed raw strings in Zod schemas.

Example:

```tsx
<h1>{t('auth.login.title')}</h1>
<label>{t('auth.login.form.email.label')}</label>
<Button>{t('common.actions.save')}</Button>
```

## Locale completeness

- Add new keys to all locale files at once.
- Do not leave one locale missing a key.
- If translation is missing, use English temporarily and add `// TODO: translate` in JSON.

## Interpolation

- Use interpolation for quantities, units, and dynamic values.

```json
{
  "expenses": {
    "stats": {
      "totalAmount": "{{amount}} total"
    }
  }
}
```

```tsx
t('expenses.stats.totalAmount', { amount: formattedTotal })
```

## Checklist

- [ ] No hardcoded user-facing text in components/pages.
- [ ] Form validation/error messages use i18n keys.
- [ ] All labels have corresponding i18n keys.
- [ ] Keys have clear contextual nested structure (`x.y.z`).
- [ ] All locale files have synchronized keys.
- [ ] Strings with dynamic values use interpolation.
- [ ] i18n entry placed at `apps/web/src/lib/i18n/index.ts`.
