import { Link } from 'react-router-dom'

import { useHouseholdContext } from '@/components/layouts/household-context-provider'
import { Badge } from '@/components/ui/badge'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { NativeSelect } from '@/components/ui/native-select'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n'

function HouseholdSwitcher() {
  const {
    activeHousehold,
    activeHouseholdId,
    households,
    isLoading,
    setActiveHouseholdId,
  } = useHouseholdContext()

  if (isLoading) {
    return (
      <div className='rounded-none border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground'>
        {t('app.householdSwitcher.loading')}
      </div>
    )
  }

  if (households.length === 0) {
    return (
      <div className='rounded-none border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground'>
        <p>{t('app.householdSwitcher.empty')}</p>
        <Link
          className='mt-2 inline-block underline underline-offset-4'
          to={PATHS.ONBOARDING}>
          {t('app.householdSwitcher.createAction')}
        </Link>
      </div>
    )
  }

  return (
    <div className='rounded-none border border-border/70 bg-muted/30 p-3'>
      <Field>
        <FieldLabel htmlFor='household-switcher-select'>
          {t('app.householdSwitcher.label')}
        </FieldLabel>
        <FieldContent>
          <NativeSelect
            id='household-switcher-select'
            value={activeHouseholdId ?? ''}
            onChange={(event) => {
              setActiveHouseholdId(event.target.value)
            }}>
            {households.map((household) => (
              <option key={household.id} value={household.id}>
                {household.name}
              </option>
            ))}
          </NativeSelect>
        </FieldContent>
      </Field>
      {activeHousehold ? (
        <div className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
          <span>{t('app.householdSwitcher.activeRole')}</span>
          <Badge variant='outline'>{activeHousehold.role}</Badge>
        </div>
      ) : null}
    </div>
  )
}

export { HouseholdSwitcher }
