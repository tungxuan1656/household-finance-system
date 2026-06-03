import type { AuthProvider } from '@/contracts'
import type { ReferenceSourceKey } from '@/contracts/reference-data'
import { notFound } from '@/lib/errors'
import { defaultLocale, type SupportedLocale } from '@/lib/i18n'
import { newId } from '@/utils/id'

export interface StoredUser {
  createdAt: number
  id: string
  displayName: string | null
  primaryEmail: string | null
  avatarUrl: string | null
  quickAddLastSourceKey: ReferenceSourceKey | null
}

interface IdentityInput {
  subject: string
  email: string | null
  name: string | null
  picture: string | null
}

export interface UpsertUserByIdentityInput extends IdentityInput {
  provider: AuthProvider
}

const toStoredUser = (row: {
  created_at: number
  id: string
  display_name: string | null
  primary_email: string | null
  avatar_url: string | null
  quick_add_last_source_key: ReferenceSourceKey | null
}): StoredUser => ({
  createdAt: row.created_at,
  id: row.id,
  displayName: row.display_name,
  primaryEmail: row.primary_email,
  avatarUrl: row.avatar_url,
  quickAddLastSourceKey: row.quick_add_last_source_key,
})

export const findIdentityUserId = async (
  db: D1Database,
  provider: AuthProvider,
  subject: string,
): Promise<string | null> => {
  const existingIdentity = await db
    .prepare(
      `SELECT user_id
       FROM auth_identities
       WHERE provider = ? AND provider_subject = ?
       LIMIT 1`,
    )
    .bind(provider, subject)
    .first<{ user_id: string }>()

  return existingIdentity?.user_id ?? null
}

export const loadUserById = async (
  db: D1Database,
  userId: string,
  locale: SupportedLocale = defaultLocale,
): Promise<StoredUser> => {
  const user = await findUserById(db, userId)

  if (!user) {
    throw notFound(locale, 'errors.userNotFound')
  }

  return user
}

export const findUserById = async (
  db: D1Database,
  userId: string,
): Promise<StoredUser | null> => {
  const user = await db
    .prepare(
      `SELECT id, created_at, display_name, primary_email, avatar_url, quick_add_last_source_key
       FROM users
       WHERE id = ?
       LIMIT 1`,
    )
    .bind(userId)
    .first<{
      created_at: number
      id: string
      display_name: string | null
      primary_email: string | null
      avatar_url: string | null
      quick_add_last_source_key: ReferenceSourceKey | null
    }>()

  return user ? toStoredUser(user) : null
}

export interface UpdateUserProfileInput {
  displayName?: string | null
  avatarUrl?: string | null
  quickAddLastSourceKey?: ReferenceSourceKey | null
}

export const updateUserProfile = async (
  db: D1Database,
  userId: string,
  input: UpdateUserProfileInput,
  locale: SupportedLocale = defaultLocale,
): Promise<StoredUser> => {
  const displayName =
    input.displayName === undefined ? undefined : input.displayName
  const avatarUrl = input.avatarUrl === undefined ? undefined : input.avatarUrl
  const quickAddLastSourceKey =
    input.quickAddLastSourceKey === undefined
      ? undefined
      : input.quickAddLastSourceKey

  await db
    .prepare(
      `UPDATE users
       SET display_name = CASE
             WHEN ?1 THEN ?2
             ELSE display_name
           END,
           avatar_url = CASE
             WHEN ?3 THEN ?4
             ELSE avatar_url
           END,
           quick_add_last_source_key = CASE
             WHEN ?5 THEN ?6
             ELSE quick_add_last_source_key
           END,
           updated_at = ?7
        WHERE id = ?`,
    )
    .bind(
      displayName !== undefined ? 1 : 0,
      displayName ?? null,
      avatarUrl !== undefined ? 1 : 0,
      avatarUrl ?? null,
      quickAddLastSourceKey !== undefined ? 1 : 0,
      quickAddLastSourceKey ?? null,
      Date.now(),
      userId,
    )
    .run()

  return loadUserById(db, userId, locale)
}

interface UpdateIdentityUserOptions {
  identity: IdentityInput
  nowEpoch: number
  locale?: SupportedLocale
}

const updateIdentityUser = async (
  db: D1Database,
  userId: string,
  provider: AuthProvider,
  options: UpdateIdentityUserOptions,
): Promise<StoredUser> => {
  const { identity, nowEpoch } = options
  const resolvedLocale = options.locale ?? defaultLocale

  await db.batch([
    db
      .prepare(
        `UPDATE users
       SET display_name = COALESCE(?, display_name),
           primary_email = COALESCE(?, primary_email),
           avatar_url = COALESCE(?, avatar_url),
           updated_at = ?
       WHERE id = ?`,
      )
      .bind(identity.name, identity.email, identity.picture, nowEpoch, userId),
    db
      .prepare(
        `UPDATE auth_identities
       SET provider_email = COALESCE(?, provider_email),
           last_login_at = ?,
           updated_at = ?
       WHERE provider = ? AND provider_subject = ?`,
      )
      .bind(identity.email, nowEpoch, nowEpoch, provider, identity.subject),
  ])

  return loadUserById(db, userId, resolvedLocale)
}

const isProviderSubjectConflictError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }

  return /UNIQUE constraint failed: auth_identities\.provider, auth_identities\.provider_subject/i.test(
    error.message,
  )
}

export const upsertUserByIdentity = async (
  db: D1Database,
  input: UpsertUserByIdentityInput,
  locale: SupportedLocale = defaultLocale,
): Promise<StoredUser> => {
  const existingIdentityUserId = await findIdentityUserId(
    db,
    input.provider,
    input.subject,
  )
  const nowEpoch = Date.now()

  if (existingIdentityUserId) {
    return updateIdentityUser(db, existingIdentityUserId, input.provider, {
      identity: input,
      nowEpoch,
      locale,
    })
  }

  const userId = newId()
  const identityId = newId()

  try {
    await db.batch([
      db
        .prepare(
          `INSERT INTO users (id, display_name, primary_email, avatar_url)
         VALUES (?, ?, ?, ?)`,
        )
        .bind(userId, input.name, input.email, input.picture),
      db
        .prepare(
          `INSERT INTO auth_identities (id, user_id, provider, provider_subject, provider_email)
         VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(identityId, userId, input.provider, input.subject, input.email),
    ])
  } catch (error) {
    if (!isProviderSubjectConflictError(error)) {
      throw error
    }

    const racedUserId = await findIdentityUserId(
      db,
      input.provider,
      input.subject,
    )

    if (!racedUserId) {
      throw error
    }

    return updateIdentityUser(db, racedUserId, input.provider, {
      identity: input,
      nowEpoch,
      locale,
    })
  }

  return loadUserById(db, userId, locale)
}

export interface FirebaseIdentityInput {
  subject: string
  email: string | null
  name: string | null
  picture: string | null
}

export const upsertUserByFirebaseIdentity = (
  db: D1Database,
  identity: FirebaseIdentityInput,
  locale: SupportedLocale = defaultLocale,
): Promise<StoredUser> =>
  upsertUserByIdentity(db, { provider: 'firebase', ...identity }, locale)

export interface TelegramIdentityInput {
  subject: string
  username: string | null
  firstName: string | null
  lastName: string | null
  photoUrl: string | null
}

export const upsertUserByTelegramIdentity = (
  db: D1Database,
  identity: TelegramIdentityInput,
  locale: SupportedLocale = defaultLocale,
): Promise<StoredUser> => {
  const displayName = [identity.firstName, identity.lastName]
    .filter(
      (part): part is string => typeof part === 'string' && part.length > 0,
    )
    .join(' ')
    .trim()

  return upsertUserByIdentity(
    db,
    {
      provider: 'telegram',
      subject: identity.subject,
      email: null,
      name: displayName.length > 0 ? displayName : identity.username,
      picture: identity.photoUrl,
    },
    locale,
  )
}
