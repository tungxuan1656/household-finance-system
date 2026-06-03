export {}

declare global {
  interface TelegramWebAppUser {
    id: number
    is_bot?: boolean
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    is_premium?: boolean
    photo_url?: string
  }

  interface TelegramWebAppThemeParams {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    header_bg_color?: string
    [key: string]: string | undefined
  }

  interface TelegramWebAppBackButton {
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }

  interface TelegramWebAppMainButton {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }

  interface TelegramWebAppHapticFeedback {
    impactOccurred: (
      style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft',
    ) => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }

  interface TelegramWebApp {
    initData: string
    initDataUnsafe: {
      user?: TelegramWebAppUser
      [key: string]: unknown
    }
    colorScheme: 'light' | 'dark'
    themeParams: TelegramWebAppThemeParams
    backgroundColor: string
    BackButton: TelegramWebAppBackButton
    MainButton: TelegramWebAppMainButton
    HapticFeedback: TelegramWebAppHapticFeedback
    isExpanded: boolean
    isFullscreen: boolean
    viewportHeight: number
    viewportStableHeight: number
    safeAreaInset: { top: number; bottom: number; left: number; right: number }
    contentSafeAreaInset: {
      top: number
      bottom: number
      left: number
      right: number
    }
    ready: () => void
    close: () => void
    expand: () => void
    requestFullscreen: () => void
    exitFullscreen: () => void
    disableVerticalSwipes: () => void
    enableVerticalSwipes: () => void
    onEvent: (event: string, handler: () => void) => void
    offEvent: (event: string, handler: () => void) => void
  }

  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}
