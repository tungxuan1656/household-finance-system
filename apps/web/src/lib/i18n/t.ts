import type { TranslationKey } from './i18n-init'
import i18n from './i18n-init'

export const t = (key: TranslationKey, options?: Record<string, unknown>) =>
  i18n.t(key, options as never) as unknown as string
