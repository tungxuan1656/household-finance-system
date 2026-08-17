import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
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
      <Badge variant={tone === 'primary' ? 'default' : 'secondary'}>
        {formatPeriodSelectionLabel(selectedPeriod, t)}
      </Badge>
    </Link>
  )
}
