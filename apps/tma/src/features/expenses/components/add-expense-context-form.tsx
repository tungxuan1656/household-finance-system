import { NativePicker } from '@/components/shared/native-picker'
import type { QueryLike } from '@/components/shared/query-state'
import { QueryState } from '@/components/shared/query-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

type AddExpenseContextFormProps = {
  householdId: string | null
  groupId: string | null
  householdPickerOptions: { value: string; label: string }[]
  groupPickerOptions: { value: string; label: string }[]
  householdsQuery: QueryLike<unknown>
  groupsQuery: QueryLike<unknown>
  setContext: (input: {
    householdId: string | null
    groupId: string | null
  }) => void
  t: (key: string, options?: Record<string, unknown>) => string
}

export const AddExpenseContextForm = ({
  householdId,
  groupId,
  householdPickerOptions,
  groupPickerOptions,
  householdsQuery,
  groupsQuery,
  setContext,
  t,
}: AddExpenseContextFormProps) => (
  <Card size='sm'>
    <CardHeader className='pb-3'>
      <CardTitle className='text-sm tracking-normal normal-case'>
        {t('expenses.add.contextSectionTitle', {
          defaultValue: 'Bối cảnh lưu trữ',
        })}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <FieldGroup className='gap-5'>
        <QueryState
          error={{
            title: t('dataState.errorTitle'),
            description: t('dataState.errorDescription'),
          }}
          isEmpty={false}
          pending={{ title: t('common.loading') }}
          query={householdsQuery}
          retryAction={() => void householdsQuery.refetch?.()}
          variant='plain'>
          {() => (
            <Field>
              <FieldLabel htmlFor='add-expense-household-picker'>
                {t('expenses.add.contextHousehold')}
              </FieldLabel>
              <NativePicker
                fullWidth
                aria-label={t('expenses.add.chooseHousehold')}
                id='add-expense-household-picker'
                options={householdPickerOptions}
                value={householdId ?? ''}
                onChange={(next) => {
                  setContext({
                    householdId: next || null,
                    groupId,
                  })
                }}
              />
            </Field>
          )}
        </QueryState>

        <QueryState
          error={{
            title: t('dataState.errorTitle'),
            description: t('dataState.errorDescription'),
          }}
          isEmpty={false}
          pending={{ title: t('common.loading') }}
          query={groupsQuery}
          retryAction={() => void groupsQuery.refetch?.()}
          variant='plain'>
          {() => (
            <Field>
              <FieldLabel htmlFor='add-expense-group-picker'>
                {t('expenses.add.contextGroup')}
              </FieldLabel>
              <NativePicker
                fullWidth
                aria-label={t('expenses.add.chooseGroup')}
                id='add-expense-group-picker'
                options={groupPickerOptions}
                value={groupId ?? ''}
                onChange={(next) => {
                  setContext({
                    householdId,
                    groupId: next || null,
                  })
                }}
              />
            </Field>
          )}
        </QueryState>
      </FieldGroup>
    </CardContent>
  </Card>
)
