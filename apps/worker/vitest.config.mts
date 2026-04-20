import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'
import { fileURLToPath } from 'node:url'

export default defineWorkersConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    poolOptions: {
      workers: {
        miniflare: {
          bindings: {
            AUTH_ISSUER: 'https://fos.local',
            AUTH_AUDIENCE: 'fos-api',
            ACCESS_TOKEN_TTL_SECONDS: '86400',
            REFRESH_TOKEN_TTL_SECONDS: '2592000',
            FIREBASE_PROJECT_ID: 'fos-local',
            FIREBASE_JWKS_URL:
              'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
            AUTH_ALLOW_INSECURE_TEST_TOKENS: 'true',
            AUTH_JWT_SECRET: 'test-auth-jwt-secret',
            AUTH_REFRESH_TOKEN_PEPPER: 'test-auth-refresh-pepper',
          },
        },
        wrangler: { configPath: './wrangler.jsonc' },
      },
    },
  },
})
