type LogLevel = 'info' | 'warn' | 'error'

type LogFields = Record<string, unknown>

const MAX_STRING_FIELD = 2000
const MAX_ERROR_MESSAGE = 500
const MAX_STACK_CHARS = 2000

const SENSITIVE_KEYS = new Set([
  'apiKey',
  'api_key',
  'authorization',
  'Authorization',
  'cookie',
  'password',
])

const truncate = (value: string, max: number): string =>
  value.length > max
    ? `${value.slice(0, max)}…[truncated:${value.length}]`
    : value

const sanitizeFields = (fields: LogFields): LogFields => {
  const out: LogFields = {}
  for (const [key, value] of Object.entries(fields)) {
    if (SENSITIVE_KEYS.has(key)) {
      out[key] = '[REDACTED]'
      continue
    }
    if (typeof value === 'string' && value.length > MAX_STRING_FIELD) {
      out[key] = truncate(value, MAX_STRING_FIELD)
      continue
    }
    out[key] = value
  }

  return out
}

const emit = (
  level: LogLevel,
  message: string,
  requestId: string | undefined,
  fields: LogFields = {},
): void => {
  const sanitized = sanitizeFields(fields)
  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitized,
  }
  if (requestId) payload.requestId = requestId

  const line = JSON.stringify(payload)

  if (level === 'error') {
    console.error(line)
  } else {
    console.log(line)
  }
}

const resolveArgs = (
  arg1: string | undefined,
  arg2: string | LogFields | undefined,
  arg3: LogFields | undefined,
): { requestId: string | undefined; message: string; fields: LogFields } => {
  if (arg2 === undefined) {
    return { requestId: undefined, message: arg1 ?? '', fields: {} }
  }
  if (typeof arg2 === 'string') {
    return { requestId: arg1, message: arg2, fields: arg3 ?? {} }
  }

  return { requestId: undefined, message: arg1 ?? '', fields: arg2 }
}

export const logger = {
  info: (
    requestIdOrMessage: string | undefined,
    messageOrFields?: string | LogFields,
    fields?: LogFields,
  ): void => {
    const {
      requestId,
      message,
      fields: f,
    } = resolveArgs(
      requestIdOrMessage,
      messageOrFields as string | LogFields | undefined,
      fields,
    )
    emit('info', message, requestId, f)
  },
  warn: (
    requestIdOrMessage: string | undefined,
    messageOrFields?: string | LogFields,
    fields?: LogFields,
  ): void => {
    const {
      requestId,
      message,
      fields: f,
    } = resolveArgs(
      requestIdOrMessage,
      messageOrFields as string | LogFields | undefined,
      fields,
    )
    emit('warn', message, requestId, f)
  },
  error: (
    requestIdOrMessage: string | undefined,
    messageOrFields?: string | LogFields,
    fields?: LogFields,
  ): void => {
    const {
      requestId,
      message,
      fields: f,
    } = resolveArgs(
      requestIdOrMessage,
      messageOrFields as string | LogFields | undefined,
      fields,
    )
    emit('error', message, requestId, f)
  },
}

export const truncateErrorMessage = (value: string): string =>
  truncate(value, MAX_ERROR_MESSAGE)

export const truncateStack = (stack: string | undefined): string | undefined =>
  stack ? truncate(stack, MAX_STACK_CHARS) : undefined

export const getBaseUrlHost = (baseUrl: string): string => {
  try {
    return new URL(baseUrl).hostname
  } catch {
    return 'unknown-host'
  }
}
