# Database Schema

Use this folder for generated or derived artifacts that agents should be able
to inspect without reverse-engineering them from code.

## Source

- Generated from: `[command or source path]`
- Last refreshed: `YYYY-MM-DD`

## Notes

- Do not hand-edit generated sections.
- Regenerate this file when the underlying schema changes.
- Current schema reality and current product truth are temporarily different: the shipped worker migration still models `expense_categories` as a household-scoped table, while product docs now define categories as a global static catalog served from checked-in code.
