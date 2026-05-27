export interface StoredHousehold {
  id: string
  name: string
  slug: string
  defaultCurrencyCode: string
  timezone: string
  role: 'admin' | 'member'
  createdAt: number
}

export interface StoredHouseholdDetail {
  id: string
  name: string
  slug: string
  defaultCurrencyCode: string
  timezone: string
  createdAt: number
}

export const toStoredHousehold = (row: {
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

export const toStoredHouseholdDetail = (row: {
  id: string
  name: string
  slug: string
  default_currency_code: string
  timezone: string
  created_at: number
}): StoredHouseholdDetail => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  defaultCurrencyCode: row.default_currency_code,
  timezone: row.timezone,
  createdAt: row.created_at,
})
