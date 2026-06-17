import packageJson from '../../../package.json'

const APP_VERSION = packageJson.version

export const AppVersionLabel = () => (
  <div
    aria-label='Phiên bản ứng dụng'
    className='text-center text-[11px] text-tma-text-muted/50'>
    v{APP_VERSION}
  </div>
)
