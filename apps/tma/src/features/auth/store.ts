// TODO(feat-129): Canonical auth session store now lives in model/store.ts.
// This re-export is kept for backward compatibility so existing imports
// `from '@/features/auth/store'` keep compiling. New code should import
// from '@/features/auth/model/store' or '@/features/auth/model'.
// Planned: remove this shim once all callers migrate and then move
// bootstrap-deps / refresh-interceptor / bootstrap into model/ + bootstrap.ts.
// See features/feat-129.md Step 4.
export * from './model/store'
