import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { Chip } from '@/components/ui'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatPeriodSelectionLabel } from '@/lib/period'
import { selection } from '@/lib/telegram/haptics'

import { usePeriodStore } from '../store'

export const PeriodChipLink = ({
  tone = 'primary',
}: {
  tone?: 'primary' | 'muted'
}) => {
  const { t } = useTranslation()
  const location = useLocation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)

  return (
    <Link
      state={{ backTo: location.pathname }}
      to={TMA_PATHS.period}
      onClick={() => {
        selection()
      }}>
      <Chip tone={tone}>{formatPeriodSelectionLabel(selectedPeriod, t)}</Chip>
    </Link>
  )
}
