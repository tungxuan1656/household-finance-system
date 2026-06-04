import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const IconBase = ({ children, ...props }: IconProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='1.9'
    viewBox='0 0 24 24'
    {...props}>
    {children}
  </svg>
)

export const HomeIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='M3.75 10.5 12 4.75l8.25 5.75' />
    <path d='M6.75 9.75v9.5h10.5v-9.5' />
  </IconBase>
)

export const StatisticsIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='M5 18.5V11' />
    <path d='M12 18.5V6' />
    <path d='M19 18.5v-8' />
  </IconBase>
)

export const SettingsIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='m12 3 1.6 2.14 2.66.42.42 2.66L19 9.82l-1.72 2.18L17.7 14.7l-2.66.42L12 17.26l-3.04-2.14-2.66-.42-.42-2.7L4 9.82l1.88-1.6.42-2.66 2.66-.42L12 3Z' />
    <circle cx='12' cy='10.14' r='2.5' />
  </IconBase>
)

export const PlusIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='M12 5v14' />
    <path d='M5 12h14' />
  </IconBase>
)

export const FilterIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='M4.5 6.5h15' />
    <path d='M7.5 12h9' />
    <path d='M10 17.5h4' />
  </IconBase>
)

export const DotsIcon = (props: IconProps) => (
  <IconBase {...props}>
    <circle cx='6.5' cy='12' fill='currentColor' r='1.2' stroke='none' />
    <circle cx='12' cy='12' fill='currentColor' r='1.2' stroke='none' />
    <circle cx='17.5' cy='12' fill='currentColor' r='1.2' stroke='none' />
  </IconBase>
)

export const ChevronLeftIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='m14.5 6.5-5 5.5 5 5.5' />
  </IconBase>
)

export const ChevronRightIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='m9.5 6.5 5 5.5-5 5.5' />
  </IconBase>
)

export const SparkIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1L6.5 8.5l4.1-1.4L12 3Z' />
    <path d='m18.25 14.5.74 2.13 2.13.74-2.13.74-.74 2.13-.74-2.13-2.13-.74 2.13-.74.74-2.13Z' />
  </IconBase>
)

export const CoinIcon = (props: IconProps) => (
  <IconBase {...props}>
    <ellipse cx='12' cy='7.5' rx='5.75' ry='2.75' />
    <path d='M6.25 7.5v6c0 1.52 2.57 2.75 5.75 2.75s5.75-1.23 5.75-2.75v-6' />
  </IconBase>
)

export const HeartIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='M12 19.25 5.8 13.1a4.02 4.02 0 0 1 5.69-5.69L12 7.92l.51-.51a4.02 4.02 0 1 1 5.69 5.69L12 19.25Z' />
  </IconBase>
)

export const GlobeIcon = (props: IconProps) => (
  <IconBase {...props}>
    <circle cx='12' cy='12' r='8.5' />
    <path d='M3.75 12h16.5' />
    <path d='M12 3.5c2.2 2.23 3.4 5.32 3.4 8.5 0 3.18-1.2 6.27-3.4 8.5-2.2-2.23-3.4-5.32-3.4-8.5 0-3.18 1.2-6.27 3.4-8.5Z' />
  </IconBase>
)

export const SunIcon = (props: IconProps) => (
  <IconBase {...props}>
    <circle cx='12' cy='12' r='3.5' />
    <path d='M12 3.5v2.25' />
    <path d='M12 18.25v2.25' />
    <path d='m5.99 5.99 1.59 1.59' />
    <path d='m16.42 16.42 1.59 1.59' />
    <path d='M3.5 12h2.25' />
    <path d='M18.25 12h2.25' />
    <path d='m5.99 18.01 1.59-1.59' />
    <path d='m16.42 7.58 1.59-1.59' />
  </IconBase>
)

export const MoonIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='M16.75 14.25A6.75 6.75 0 0 1 9.75 5.5a7.75 7.75 0 1 0 7 8.75Z' />
  </IconBase>
)

export const CalendarIcon = (props: IconProps) => (
  <IconBase {...props}>
    <rect height='13.5' rx='3' width='14.5' x='4.75' y='5.75' />
    <path d='M8 4.5v3' />
    <path d='M16 4.5v3' />
    <path d='M4.75 10h14.5' />
  </IconBase>
)

export const NoteIcon = (props: IconProps) => (
  <IconBase {...props}>
    <rect height='14.5' rx='3' width='14' x='5' y='4.75' />
    <path d='M8.25 9.25h7.5' />
    <path d='M8.25 12.5h7.5' />
    <path d='M8.25 15.75h4.5' />
  </IconBase>
)

export const CameraIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='M5.25 8.25h13.5a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-7a1.5 1.5 0 0 1 1.5-1.5Z' />
    <path d='m8 8.25 1.15-2h5.7l1.15 2' />
    <circle cx='12' cy='13' r='3.25' />
  </IconBase>
)

export const RefreshIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='M19 6.75v4.5h-4.5' />
    <path d='M18.25 11.25a6.5 6.5 0 1 0 1.25 3.75' />
  </IconBase>
)

export const CloseIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d='m6.5 6.5 11 11' />
    <path d='m17.5 6.5-11 11' />
  </IconBase>
)
