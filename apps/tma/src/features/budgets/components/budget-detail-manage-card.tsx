import type { FormEvent } from 'react'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { formatAmountInput } from '@/lib/formatters'

type BudgetManageCardProps = {
  isEditing: boolean
  totalLimitInput: string
  onTotalLimitChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
  isUpdatePending: boolean
  isDeletePending: boolean
  t: (key: string, options?: Record<string, unknown>) => string
}

export const BudgetManageCard = ({
  isEditing,
  totalLimitInput,
  onTotalLimitChange,
  onSubmit,
  onStartEdit,
  onCancelEdit,
  onDelete,
  isUpdatePending,
  isDeletePending,
  t,
}: BudgetManageCardProps) => (
  <Card size='sm'>
    <CardHeader>
      <CardTitle>{t('budgets.detail.sectionManage')}</CardTitle>
    </CardHeader>
    <CardContent>
      <form className='grid gap-4' id='budget-edit-form' onSubmit={onSubmit}>
        <FieldGroup className='gap-4'>
          <Field>
            <FieldLabel htmlFor='budget-detail-limit'>
              {t('budgets.detail.manageLimit')}
            </FieldLabel>
            <Input
              disabled={!isEditing || isUpdatePending}
              id='budget-detail-limit'
              inputMode='numeric'
              value={totalLimitInput}
              onChange={(event) =>
                onTotalLimitChange(formatAmountInput(event.target.value))
              }
            />
          </Field>
        </FieldGroup>

        {!isEditing ? (
          <div className='flex justify-end gap-2'>
            <TmaHapticButton
              type='button'
              variant='secondary'
              onClick={onStartEdit}>
              {t('budgets.detail.editAction')}
            </TmaHapticButton>
            <TmaHapticButton
              aria-busy={isDeletePending}
              disabled={isDeletePending}
              type='button'
              variant='destructive'
              onClick={onDelete}>
              {isDeletePending
                ? t('budgets.detail.deleting')
                : t('budgets.detail.deleteAction')}
            </TmaHapticButton>
          </div>
        ) : (
          <div className='hidden'>
            <TmaHapticButton
              type='button'
              variant='secondary'
              onClick={onCancelEdit}>
              {t('common.cancel')}
            </TmaHapticButton>
          </div>
        )}
      </form>
    </CardContent>
  </Card>
)
