// Auth model barrel — single import surface for session state.
// Future: bootstrap logic (bootstrap.tsx, bootstrap-deps.ts, refresh-interceptor.ts)
// will be consolidated under model/ + bootstrap.ts with internal seams
// testable without Provider. For now only the store is moved to avoid
// risky behavior change (feat-129 Step 4 TODO).
export * from './store'
