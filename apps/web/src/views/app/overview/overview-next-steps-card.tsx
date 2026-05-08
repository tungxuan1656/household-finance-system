import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

function OverviewNextStepsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('app.overview.nextSteps.title')}</CardTitle>
        <CardDescription>
          {t('app.overview.nextSteps.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        <Button
          asChild
          className='min-h-11 w-full justify-start'
          variant='outline'>
          <Link href={PATHS.EXPENSES}>
            {t('app.overview.actions.openExpenses')}
          </Link>
        </Button>
        <Button
          asChild
          className='min-h-11 w-full justify-start'
          variant='outline'>
          <Link href={PATHS.BUDGETS}>
            {t('app.overview.actions.openBudgetSetup')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export { OverviewNextStepsCard }
