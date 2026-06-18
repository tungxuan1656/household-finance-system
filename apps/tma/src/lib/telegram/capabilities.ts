import {
  backButton,
  hapticFeedback,
  mainButton,
  secureStorage,
  themeParams,
} from '@tma.js/sdk'

type Capability =
  | 'secureStorage'
  | 'deviceStorage'
  | 'hapticFeedback'
  | 'themeParams'
  | 'backButton'
  | 'mainButton'

export const isSupported = (capability: Capability): boolean => {
  switch (capability) {
    case 'secureStorage':
      return secureStorage.setItem.isAvailable()
    case 'deviceStorage':
      return false
    case 'hapticFeedback':
      return hapticFeedback.isSupported()
    case 'themeParams':
      return themeParams.isMounted()
    case 'backButton':
      return backButton.isSupported()
    case 'mainButton':
      return mainButton.isMounted()
  }
}
