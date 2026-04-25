import type { HouseholdDTO, ListHouseholdsResponse } from '@/contracts'
import { listUserHouseholds } from '@/db/repositories/household-repository'
import type { AppBindings } from '@/types'

const toHouseholdDto = (input: {
  id: string
  name: string
  slug: string
  defaultCurrencyCode: string
  timezone: string
  role: 'admin' | 'member'
  createdAt: number
}): HouseholdDTO => ({
  id: input.id,
  name: input.name,
  slug: input.slug,
  defaultCurrencyCode: input.defaultCurrencyCode,
  timezone: input.timezone,
  role: input.role,
  createdAt: input.createdAt,
})

export const listHouseholds = async (
  env: AppBindings['Bindings'],
  userId: string,
): Promise<ListHouseholdsResponse> => {
  const households = await listUserHouseholds(env.DB, userId)

  return {
    items: households.map(toHouseholdDto),
  }
}
