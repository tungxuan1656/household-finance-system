import { redirect } from 'next/navigation'

import { PATHS } from '@/lib/constants/paths'

export default function HomeRoutePage() {
  redirect(PATHS.APP_ROOT)
}
