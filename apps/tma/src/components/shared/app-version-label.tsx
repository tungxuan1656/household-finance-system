import { cn } from '@/lib/utils'

const APP_VERSION = import.meta.env.VITE_APP_VERSION

export const AppVersionLabel = ({ className }: { className?: string }) => (
  <div
    aria-label='Phiên bản ứng dụng'
    className={cn(
      'text-center text-[11px] leading-none text-muted-foreground/50',
      className,
    )}>
    v{APP_VERSION}
  </div>
)
