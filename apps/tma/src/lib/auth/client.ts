import { secureStorage } from '@tma.js/sdk'

import {
  type AuthStorage,
  createAuthStorage,
  type CreateAuthStorageOptions,
  type SecureStorageLike,
} from '@/lib/storage/adapter'

import { type AuthApiClient, createAuthApiClient } from './api'

const DEFAULT_BASE_URL = '/api/v1'

export interface CreateTmaAuthClientOptions {
  baseUrl?: string
  fetchImpl?: typeof fetch
  storageOverride?: AuthStorage
  apiOverride?: AuthApiClient
  secureStorageOverride?: SecureStorageLike | null
}

export interface TmaAuthClient {
  api: AuthApiClient
  storage: AuthStorage
}

const buildSecureStorageArg = (
  options: CreateTmaAuthClientOptions,
): CreateAuthStorageOptions['secureStorage'] =>
  options.secureStorageOverride ??
  (secureStorage as unknown as SecureStorageLike | undefined) ??
  null

export const createTmaAuthClient = (
  options: CreateTmaAuthClientOptions = {},
): TmaAuthClient => {
  const storage =
    options.storageOverride ??
    createAuthStorage({
      secureStorage: buildSecureStorageArg(options),
    })

  const api =
    options.apiOverride ??
    createAuthApiClient({
      baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
      fetchImpl: options.fetchImpl,
      accessTokenProvider: () => null,
    })

  return { api, storage }
}
