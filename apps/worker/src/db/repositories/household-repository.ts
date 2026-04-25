import { conflict, notFound } from '@/lib/errors'
import { defaultLocale, type SupportedLocale } from '@/lib/i18n'
import { newId } from '@/utils/id'

export interface StoredHousehold {
  id: string
  name: string
  slug: string
  defaultCurrencyCode: string
  timezone: string
  role: 'admin' | 'member'
  createdAt: number
}

export interface CreateHouseholdInput {
  name: string
  defaultCurrencyCode: string
}

const isSlugConflictError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }

  return /UNIQUE constraint failed: households\.slug/i.test(error.message)
}

const toStoredHousehold = (row: {
  id: string
  name: string
  slug: string
  default_currency_code: string
  timezone: string
  role: 'admin' | 'member'
  created_at: number
}): StoredHousehold => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  defaultCurrencyCode: row.default_currency_code,
  timezone: row.timezone,
  role: row.role,
  createdAt: row.created_at,
})

const createSlug = (value: string): string => {
  const normalized = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')

  const slug = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

  if (slug.length > 0) {
    return slug
  }

  return 'household'
}

export const listUserHouseholds = async (
  db: D1Database,
  userId: string,
): Promise<StoredHousehold[]> => {
  const result = await db
    .prepare(
      `SELECT h.id,
              h.name,
              h.slug,
              h.default_currency_code,
              h.timezone,
              hm.role,
              h.created_at
         FROM households h
         INNER JOIN household_memberships hm ON hm.household_id = h.id
        WHERE hm.user_id = ?
          AND hm.state = 'active'
          AND h.archived_at IS NULL
        ORDER BY h.created_at ASC`,
    )
    .bind(userId)
    .all<{
      id: string
      name: string
      slug: string
      default_currency_code: string
      timezone: string
      role: 'admin' | 'member'
      created_at: number
    }>()

  return result.results.map(toStoredHousehold)
}

export const findUserHouseholdById = async (
  db: D1Database,
  userId: string,
  householdId: string,
): Promise<StoredHousehold | null> => {
  const row = await db
    .prepare(
      `SELECT h.id,
              h.name,
              h.slug,
              h.default_currency_code,
              h.timezone,
              hm.role,
              h.created_at
         FROM households h
         INNER JOIN household_memberships hm ON hm.household_id = h.id
        WHERE hm.user_id = ?
          AND hm.state = 'active'
          AND h.id = ?
          AND h.archived_at IS NULL
        LIMIT 1`,
    )
    .bind(userId, householdId)
    .first<{
      id: string
      name: string
      slug: string
      default_currency_code: string
      timezone: string
      role: 'admin' | 'member'
      created_at: number
    }>()

  if (!row) {
    return null
  }

  return toStoredHousehold(row)
}

export const createHouseholdForUser = async (
  db: D1Database,
  userId: string,
  input: CreateHouseholdInput,
  locale: SupportedLocale = defaultLocale,
): Promise<StoredHousehold> => {
  const baseSlug = createSlug(input.name)

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const householdId = newId()
    const membershipId = newId()
    const nowEpoch = Date.now()
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`

    try {
      await db.batch([
        db
          .prepare(
            `INSERT INTO households (
              id,
              name,
              slug,
              default_currency_code,
              timezone,
              created_by_user_id,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            householdId,
            input.name,
            slug,
            input.defaultCurrencyCode,
            'UTC',
            userId,
            nowEpoch,
            nowEpoch,
          ),
        db
          .prepare(
            `INSERT INTO household_memberships (
              id,
              household_id,
              user_id,
              role,
              state,
              joined_at,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            membershipId,
            householdId,
            userId,
            'admin',
            'active',
            nowEpoch,
            nowEpoch,
            nowEpoch,
          ),
      ])
    } catch (error) {
      if (isSlugConflictError(error)) {
        continue
      }

      throw error
    }

    const createdHousehold = await findUserHouseholdById(
      db,
      userId,
      householdId,
    )

    if (!createdHousehold) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    return createdHousehold
  }

  throw conflict(locale, 'errors.conflict')
}
