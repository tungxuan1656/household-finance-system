'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAddExpenseDialog } from '@/features/expenses/components/add-expense/provider'
import { HouseholdInviteDialog } from '@/features/households/components/household-invite-dialog'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

interface OnboardingCompleteCardProps {
  activeHouseholdId: string | null
}

function OnboardingCompleteCard({
  activeHouseholdId,
}: OnboardingCompleteCardProps) {
  const { openDialog } = useAddExpenseDialog()

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>{t('app.onboarding.complete.title')}</CardTitle>
          <CardDescription>
            {t('app.onboarding.complete.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {activeHouseholdId ? (
            <HouseholdInviteDialog householdId={activeHouseholdId} />
          ) : (
            <Button disabled type='button' variant='outline'>
              {t('app.onboarding.actions.openInviteMembers')}
            </Button>
          )}
          <Button asChild type='button' variant='outline'>
            <Link href={PATHS.BUDGETS}>
              {t('app.onboarding.actions.openBudgetSetup')}
            </Link>
          </Button>
          <Button type='button' variant='outline' onClick={openDialog}>
            {t('app.onboarding.actions.openQuickAdd')}
          </Button>
          <Button asChild type='button'>
            <Link href={PATHS.HOUSEHOLDS}>
              {t('app.onboarding.actions.finish')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export { OnboardingCompleteCard }
