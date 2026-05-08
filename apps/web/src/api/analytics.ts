import { ApiClientError, client } from '@/api/client'
import { API_BASE_PATH, API_ENDPOINTS } from '@/api/endpoints'
import { authActions, useAuthStore } from '@/stores/auth.store'
import type {
  AnalyticsComparisonDTO,
  AnalyticsComparisonParams,
  AnalyticsExportParams,
  AnalyticsExportResult,
  AnalyticsGroupsDTO,
  AnalyticsGroupsParams,
  AnalyticsOverviewDTO,
  AnalyticsOverviewParams,
} from '@/types/analytics'
import type { ApiErrorCode } from '@/types/api'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isApiErrorCode = (value: unknown): value is ApiErrorCode =>
  typeof value === 'string'

const getExportFilename = (
  contentDisposition: string | undefined,
): string | null => {
  if (!contentDisposition) {
    return null
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i)

  return filenameMatch?.[1] ?? null
}

const toExportError = async (response: Response): Promise<Error> => {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as unknown

    if (
      isRecord(payload) &&
      payload.success === false &&
      isRecord(payload.error) &&
      typeof payload.error.message === 'string' &&
      isApiErrorCode(payload.error.code)
    ) {
      return new ApiClientError({
        code: payload.error.code,
        details: payload.error.details,
        message: payload.error.message,
        requestId:
          isRecord(payload.meta) && typeof payload.meta.requestId === 'string'
            ? payload.meta.requestId
            : undefined,
        status: response.status,
      })
    }
  }

  return new ApiClientError({
    code: 'HTTP_ERROR',
    message: `Request failed with status ${response.status}.`,
    status: response.status,
  })
}

export const getAnalyticsOverview = async (params: AnalyticsOverviewParams) => {
  const response = await client.get<AnalyticsOverviewDTO>(
    API_ENDPOINTS.analytics.overview,
    { params },
  )

  return response.data
}

export const getAnalyticsComparison = async (
  params: AnalyticsComparisonParams,
) => {
  const response = await client.get<AnalyticsComparisonDTO>(
    API_ENDPOINTS.analytics.comparison,
    { params },
  )

  return response.data
}

export const getAnalyticsGroups = async (params: AnalyticsGroupsParams) => {
  const response = await client.get<AnalyticsGroupsDTO>(
    API_ENDPOINTS.analytics.groups,
    { params },
  )

  return response.data
}

export const getAnalyticsExport = async (
  params: AnalyticsExportParams,
): Promise<AnalyticsExportResult> => {
  const searchParams = new URLSearchParams()
  searchParams.set('period', params.period)

  if (params.household_id) {
    searchParams.set('household_id', params.household_id)
  }

  const accessToken = useAuthStore.getState().accessToken

  const response = await fetch(
    `${API_BASE_PATH}${API_ENDPOINTS.analytics.export}?${searchParams.toString()}`,
    {
      headers: {
        accept: 'text/csv',
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
    },
  )

  if (!response.ok) {
    if (response.status === 401) {
      authActions.clearSession()
    }

    throw await toExportError(response)
  }

  return {
    blob: await response.blob(),
    filename: getExportFilename(
      response.headers.get('content-disposition') ?? undefined,
    ),
  }
}
