import {
  listExpenseGroupsByHouseholdIds,
  listExpenseGroupsByOwner,
} from '@/db/repositories/expense-group-repository'
import { listUserHouseholds } from '@/db/repositories/household-repository'
import type { RawAiItem } from '@/lib/ai/expense-parser'
import { AI_CONTEXT_MAX_ITEMS } from '@/lib/ai/expense-parser'
import { logger, truncateErrorMessage } from '@/lib/logger'

export { AI_CONTEXT_MAX_ITEMS } from '@/lib/ai/expense-parser'

export const normalizeNameKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    // 'đ' (U+0111) does not decompose under NFD, so replace manually; after toLowerCase only 'đ' remains (not 'Đ')
    .replaceAll('đ', 'd')

const warnContextFetchFailed = (
  error: unknown,
  requestId: string | undefined,
): void => {
  logger.warn(requestId, 'parse_expense_context_fetch_failed', {
    errorName: error instanceof Error ? error.name : 'UnknownError',
    errorMessage:
      error instanceof Error
        ? truncateErrorMessage(error.message)
        : truncateErrorMessage(String(error)),
  })
}

export const fetchAiContext = async (
  db: D1Database,
  userId: string,
  requestId: string | undefined,
): Promise<{
  availableHouseholds: { id: string; name: string }[]
  availableGroups: { id: string; name: string; householdId: string | null }[]
  householdNameToId: Map<string, string>
  groupNameToId: Map<string, string>
  groupIdToHouseholdId: Map<string, string | null>
}> => {
  let availableHouseholds: { id: string; name: string }[] = []
  let availableGroups: {
    id: string
    name: string
    householdId: string | null
  }[] = []
  const householdNameToId = new Map<string, string>()
  const groupNameToId = new Map<string, string>()
  const groupIdToHouseholdId = new Map<string, string | null>()

  try {
    const [households, personalGroups] = await Promise.all([
      listUserHouseholds(db, userId).catch((error: unknown) => {
        warnContextFetchFailed(error, requestId)

        return []
      }),
      listExpenseGroupsByOwner(db, userId).catch((error: unknown) => {
        warnContextFetchFailed(error, requestId)

        return []
      }),
    ])

    let householdGroups: typeof personalGroups = []
    if (households.length > 0) {
      try {
        const householdIds = households.map((h) => h.id)

        householdGroups = await listExpenseGroupsByHouseholdIds(
          db,
          householdIds,
        )
      } catch (error: unknown) {
        warnContextFetchFailed(error, requestId)

        householdGroups = []
      }
    }

    const allGroups = [...householdGroups, ...personalGroups]

    // Cap 15 each, most recent first. Households are ASC so sort desc; groups need global recency sort.
    const sortedHouseholds = [...households].sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
    )

    availableHouseholds = sortedHouseholds
      .slice(0, AI_CONTEXT_MAX_ITEMS)
      .map((h) => ({ id: h.id, name: h.name }))

    const sortedGroups = [...allGroups].sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
    )

    availableGroups = sortedGroups
      .slice(0, AI_CONTEXT_MAX_ITEMS)
      .map((g) => ({ id: g.id, name: g.name, householdId: g.householdId }))

    for (const h of availableHouseholds) {
      const rawKey = h.name.trim().toLowerCase()
      const normKey = normalizeNameKey(h.name)
      if (!householdNameToId.has(rawKey)) householdNameToId.set(rawKey, h.id)
      if (!householdNameToId.has(normKey)) {
        householdNameToId.set(normKey, h.id)
      } else if (householdNameToId.get(normKey) !== h.id) {
        logger.warn(requestId, 'parse_expense_name_collision', {
          normalizedKey: normKey,
          keptId: householdNameToId.get(normKey),
          droppedName: h.name,
        })
      }
    }
    for (const g of availableGroups) {
      const rawKey = g.name.trim().toLowerCase()
      const normKey = normalizeNameKey(g.name)
      if (!groupNameToId.has(rawKey)) groupNameToId.set(rawKey, g.id)
      if (!groupNameToId.has(normKey)) {
        groupNameToId.set(normKey, g.id)
      } else if (groupNameToId.get(normKey) !== g.id) {
        logger.warn(requestId, 'parse_expense_name_collision', {
          normalizedKey: normKey,
          keptId: groupNameToId.get(normKey),
          droppedName: g.name,
        })
      }
      groupIdToHouseholdId.set(g.id, g.householdId)
    }
  } catch (error: unknown) {
    warnContextFetchFailed(error, requestId)

    availableHouseholds = []
    availableGroups = []
  }

  return {
    availableHouseholds,
    availableGroups,
    householdNameToId,
    groupNameToId,
    groupIdToHouseholdId,
  }
}

export const mapAiNamesToIds = (
  rawItem: RawAiItem,
  maps: {
    householdNameToId: Map<string, string>
    groupNameToId: Map<string, string>
    groupIdToHouseholdId?: Map<string, string | null>
  },
  counters?: { mappedHouseholdCount: number; mappedGroupCount: number },
  options?: {
    requestId?: string
    filterGroupByHousehold?: boolean
    householdId?: string | null
  },
): { householdId: string | null; groupIds: string[] } => {
  let householdId: string | null = null
  const rawHouseholdName =
    typeof rawItem.householdName === 'string'
      ? rawItem.householdName.trim()
      : null
  if (rawHouseholdName) {
    const rawKey = rawHouseholdName.toLowerCase()
    const normKey = normalizeNameKey(rawHouseholdName)
    const mapped =
      maps.householdNameToId.get(rawKey) ??
      maps.householdNameToId.get(normKey) ??
      null
    householdId = mapped
    if (mapped && counters) counters.mappedHouseholdCount++
  }

  const rawGroupNames = Array.isArray(rawItem.groupNames)
    ? rawItem.groupNames
    : []
  const groupIdSet = new Set<string>()
  let droppedMismatch = 0
  for (const gName of rawGroupNames) {
    if (typeof gName !== 'string') continue

    const trimmed = gName.trim()
    if (!trimmed) continue

    const rawKey = trimmed.toLowerCase()
    const normKey = normalizeNameKey(trimmed)
    const gid =
      maps.groupNameToId.get(rawKey) ?? maps.groupNameToId.get(normKey) ?? null
    if (gid) {
      // Filter by household tenancy when requested
      if (options?.filterGroupByHousehold && maps.groupIdToHouseholdId) {
        const groupHouseholdId = maps.groupIdToHouseholdId.get(gid) ?? null
        const targetHouseholdId = options.householdId ?? householdId
        // Keep if both null (personal) or same household; otherwise drop
        if (groupHouseholdId !== targetHouseholdId) {
          droppedMismatch++
          continue
        }
      }
      groupIdSet.add(gid)
    }
  }

  if (droppedMismatch > 0 && options?.requestId) {
    logger.warn(options.requestId, 'dropped_group_household_mismatch', {
      droppedCount: droppedMismatch,
      householdId: options.householdId ?? householdId,
    })
  }

  const groupIds = Array.from(groupIdSet)
  if (groupIds.length > 0 && counters)
    counters.mappedGroupCount += groupIds.length

  return { householdId, groupIds }
}
