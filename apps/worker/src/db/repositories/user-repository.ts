import { newId } from '@/utils/shared/id'

export interface StoredUser {
  id: string
  displayName: string | null
  primaryEmail: string | null
  avatarUrl: string | null
}

interface FirebaseIdentityInput {
  subject: string
  email: string | null
  name: string | null
  picture: string | null
}

const toStoredUser = (row: {
  id: string
  display_name: string | null
  primary_email: string | null
  avatar_url: string | null
}): StoredUser => ({
  id: row.id,
  displayName: row.display_name,
  primaryEmail: row.primary_email,
  avatarUrl: row.avatar_url,
})

const findIdentityUserId = async (
  db: D1Database,
  subject: string,
): Promise<string | null> => {
  const existingIdentity = await db
    .prepare(
      `SELECT user_id
       FROM auth_identities
       WHERE provider = ? AND provider_subject = ?
       LIMIT 1`,
    )
    .bind('firebase', subject)
    .first<{ user_id: string }>()

  return existingIdentity?.user_id ?? null
}

export const loadUserById = async (
  db: D1Database,
  userId: string,
): Promise<StoredUser> => {
  const user = await findUserById(db, userId)

  if (!user) {
    throw new Error('User upsert failed unexpectedly')
  }

  return user
}

export const findUserById = async (
  db: D1Database,
  userId: string,
): Promise<StoredUser | null> => {
  const user = await db
    .prepare(
      `SELECT id, display_name, primary_email, avatar_url
       FROM users
       WHERE id = ?
       LIMIT 1`,
    )
    .bind(userId)
    .first<{
      id: string
      display_name: string | null
      primary_email: string | null
      avatar_url: string | null
    }>()

  return user ? toStoredUser(user) : null
}

export interface UpdateUserProfileInput {
  displayName?: string | null
  avatarUrl?: string | null
}

export const updateUserProfile = async (
  db: D1Database,
  userId: string,
  input: UpdateUserProfileInput,
): Promise<StoredUser> => {
  const displayName =
    input.displayName === undefined ? undefined : input.displayName
  const avatarUrl = input.avatarUrl === undefined ? undefined : input.avatarUrl

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
           updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      displayName !== undefined ? 1 : 0,
      displayName ?? null,
      avatarUrl !== undefined ? 1 : 0,
      avatarUrl ?? null,
      Date.now(),
      userId,
    )
    .run()

  return loadUserById(db, userId)
}

const updateIdentityUser = async (
  db: D1Database,
  userId: string,
  identity: FirebaseIdentityInput,
  nowEpoch: number,
): Promise<StoredUser> => {
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
      .bind(identity.email, nowEpoch, nowEpoch, 'firebase', identity.subject),
  ])

  return loadUserById(db, userId)
}

const isProviderSubjectConflictError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }

  return /UNIQUE constraint failed: auth_identities\.provider, auth_identities\.provider_subject/i.test(
    error.message,
  )
}

export const upsertUserByFirebaseIdentity = async (
  db: D1Database,
  identity: FirebaseIdentityInput,
): Promise<StoredUser> => {
  const existingIdentityUserId = await findIdentityUserId(db, identity.subject)
  const nowEpoch = Date.now()

  if (existingIdentityUserId) {
    return updateIdentityUser(db, existingIdentityUserId, identity, nowEpoch)
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
        .bind(userId, identity.name, identity.email, identity.picture),
      db
        .prepare(
          `INSERT INTO auth_identities (id, user_id, provider, provider_subject, provider_email)
         VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(identityId, userId, 'firebase', identity.subject, identity.email),
    ])
  } catch (error) {
    if (!isProviderSubjectConflictError(error)) {
      throw error
    }

    const racedUserId = await findIdentityUserId(db, identity.subject)

    if (!racedUserId) {
      throw error
    }

    return updateIdentityUser(db, racedUserId, identity, nowEpoch)
  }

  return loadUserById(db, userId)
}
