/**
 * Households API — exception to flat `api.ts` skeleton.
 *
 * feat-129 skeleton mandates one `api.ts` per feature, but households
 * aggregates 5 domain slices (households, analytics, budgets, expenses,
 * categories) totaling 466 lines (>400 threshold). Merging into a single
 * file would hurt locality and exceed the documented exception.
 * Keep this `api/` folder; barrel re-exports preserve `from
 * '@/features/households/api'` import path.
 * If any slice shrinks, consider merging back to flat `api.ts`.
 */
export * from './analytics'
export * from './budgets'
export * from './categories'
export * from './expenses'
export * from './households'
