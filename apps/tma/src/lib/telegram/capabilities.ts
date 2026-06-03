import {
  backButton,
  hapticFeedback,
  mainButton,
  themeParams,
} from '@tma.js/sdk'

type Capability =
  | 'secureStorage'
  | 'deviceStorage'
  | 'hapticFeedback'
  | 'themeParams'
  | 'backButton'
  | 'mainButton'

const detect = (capability: Capability): boolean => {
  switch (capability) {
    case 'secureStorage':
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

export const isSupported = (capability: Capability): boolean =>
  detect(capability)
