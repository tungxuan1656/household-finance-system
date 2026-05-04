type BrowserStorageMethod = 'clear' | 'getItem' | 'removeItem' | 'setItem'
type BrowserStorageKind = 'local' | 'session'

const getBrowserStorage = (kind: BrowserStorageKind): Storage | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

const callStorageMethod = <ReturnType>(
  kind: BrowserStorageKind,
  method: BrowserStorageMethod,
  args: unknown[],
): ReturnType | null => {
  const storage = getBrowserStorage(kind)

  if (!storage) {
    return null
  }

  const prototypeMethod = (
    Storage.prototype as Record<BrowserStorageMethod, unknown>
  )[method]

  if (typeof prototypeMethod === 'function') {
    try {
      return Reflect.apply(
        prototypeMethod as (...methodArgs: unknown[]) => ReturnType,
        storage,
        args,
      )
    } catch {
      // Some jsdom/vitest storage shims expose a broken Storage receiver.
      // Fall through to the best-effort object method or a no-op return.
    }
  }

  const storageMethod = storage[method] as unknown

  if (typeof storageMethod === 'function') {
    try {
      return Reflect.apply(
        storageMethod as (...methodArgs: unknown[]) => ReturnType,
        storage,
        args,
      )
    } catch {
      return null
    }
  }

  return null
}

export const readLocalStorageItem = (key: string) =>
  callStorageMethod<string | null>('local', 'getItem', [key])

export const writeLocalStorageItem = (key: string, value: string) => {
  callStorageMethod<void>('local', 'setItem', [key, value])
}

export const removeLocalStorageItem = (key: string) => {
  callStorageMethod<void>('local', 'removeItem', [key])
}

export const clearLocalStorage = () => {
  callStorageMethod<void>('local', 'clear', [])
}

export const readSessionStorageItem = (key: string) =>
  callStorageMethod<string | null>('session', 'getItem', [key])

export const writeSessionStorageItem = (key: string, value: string) => {
  callStorageMethod<void>('session', 'setItem', [key, value])
}
