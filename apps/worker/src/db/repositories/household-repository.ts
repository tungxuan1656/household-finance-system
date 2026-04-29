import { conflict, notFound } from '@/lib/errors'
import { defaultLocale, type SupportedLocale } from '@/lib/i18n'
import { newId } from '@/utils/id'

export interface StoredHousehold {
  id: string
  name: string
  slug: string
  defaultCurrencyCode: string
  timezone: string
  defaultVisibility: 'private' | 'household'
  role: 'admin' | 'member'
  createdAt: number
}

export interface StoredHouseholdDetail {
  id: string
  name: string
  slug: string
  defaultCurrencyCode: string
  timezone: string
  defaultVisibility: 'private' | 'household'
  createdAt: number
}

export interface CreateHouseholdInput {
  name: string
  defaultCurrencyCode?: string
}

export interface UpdateHouseholdInput {
  name?: string
  defaultCurrencyCode?: string
  timezone?: string
  defaultVisibility?: 'private' | 'household'
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
  default_visibility: 'private' | 'household'
  role: 'admin' | 'member'
  created_at: number
}): StoredHousehold => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  defaultCurrencyCode: row.default_currency_code,
  timezone: row.timezone,
  defaultVisibility: row.default_visibility,
  role: row.role,
  createdAt: row.created_at,
})

const toStoredHouseholdDetail = (row: {
  id: string
  name: string
  slug: string
  default_currency_code: string
  timezone: string
  default_visibility: 'private' | 'household'
  created_at: number
}): StoredHouseholdDetail => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  defaultCurrencyCode: row.default_currency_code,
  timezone: row.timezone,
  defaultVisibility: row.default_visibility,
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
              h.default_visibility,
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
      default_visibility: 'private' | 'household'
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
              h.default_visibility,
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
      default_visibility: 'private' | 'household'
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
              default_visibility,
              created_by_user_id,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            householdId,
            input.name,
            slug,
            input.defaultCurrencyCode ?? 'VND',
            'Asia/Ho_Chi_Minh',
            'household',
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

export const findHouseholdById = async (
  db: D1Database,
  householdId: string,
): Promise<StoredHouseholdDetail | null> => {
  const household = await db
    .prepare(
      `SELECT h.id,
              h.name,
              h.slug,
              h.default_currency_code,
              h.timezone,
              h.default_visibility,
              h.created_at
         FROM households h
        WHERE h.id = ?
          AND h.archived_at IS NULL
        LIMIT 1`,
    )
    .bind(householdId)
    .first<{
      id: string
      name: string
      slug: string
      default_currency_code: string
      timezone: string
      default_visibility: 'private' | 'household'
      created_at: number
    }>()

  if (!household) {
    return null
  }

  return toStoredHouseholdDetail(household)
}

export const updateHouseholdById = async (
  db: D1Database,
  householdId: string,
  input: UpdateHouseholdInput,
): Promise<boolean> => {
  const nowEpoch = Date.now()
  const result = await db
    .prepare(
      `UPDATE households
       SET name = CASE
             WHEN ?1 THEN ?2
             ELSE name
           END,
           default_currency_code = CASE
             WHEN ?3 THEN ?4
             ELSE default_currency_code
           END,
           timezone = CASE
             WHEN ?5 THEN ?6
             ELSE timezone
           END,
           default_visibility = CASE
             WHEN ?7 THEN ?8
             ELSE default_visibility
           END,
           updated_at = ?9
       WHERE id = ?10
         AND archived_at IS NULL`,
    )
    .bind(
      input.name !== undefined ? 1 : 0,
      input.name ?? null,
      input.defaultCurrencyCode !== undefined ? 1 : 0,
      input.defaultCurrencyCode ?? null,
      input.timezone !== undefined ? 1 : 0,
      input.timezone ?? null,
      input.defaultVisibility !== undefined ? 1 : 0,
      input.defaultVisibility ?? null,
      nowEpoch,
      householdId,
    )
    .run()

  return Number(result.meta.changes ?? 0) === 1
}

export const archiveHouseholdById = async (
  db: D1Database,
  householdId: string,
): Promise<boolean> => {
  const nowEpoch = Date.now()
  const result = await db
    .prepare(
      `UPDATE households
       SET archived_at = ?1,
           updated_at = ?1
       WHERE id = ?2
         AND archived_at IS NULL`,
    )
    .bind(nowEpoch, householdId)
    .run()

  return Number(result.meta.changes ?? 0) === 1
}
