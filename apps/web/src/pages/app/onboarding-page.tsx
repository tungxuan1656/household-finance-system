import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/components/ui/empty'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { t } from '@/lib/i18n'

function OnboardingPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <span aria-hidden='true'>✨</span>
        </EmptyMedia>
        <h1 className='font-heading text-2xl tracking-tight'>
          {t('app.onboarding.title')}
        </h1>
        <EmptyDescription>{t('app.onboarding.description')}</EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className='grid w-full gap-4 rounded-none border border-border/70 bg-background/70 p-4 text-left backdrop-blur sm:p-5'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Field>
              <FieldLabel htmlFor='household-name'>
                {t('app.onboarding.fields.householdName.label')}
              </FieldLabel>
              <FieldContent>
                <FieldDescription>
                  {t('app.onboarding.fields.householdName.description')}
                </FieldDescription>
                <Input
                  id='household-name'
                  name='householdName'
                  placeholder={t(
                    'app.onboarding.fields.householdName.placeholder',
                  )}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor='currency'>
                {t('app.onboarding.fields.currency.label')}
              </FieldLabel>
              <FieldContent>
                <FieldDescription>
                  {t('app.onboarding.fields.currency.description')}
                </FieldDescription>
                <NativeSelect defaultValue='usd' id='currency' name='currency'>
                  <option value='usd'>USD</option>
                  <option value='vnd'>VND</option>
                  <option value='eur'>EUR</option>
                </NativeSelect>
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor='welcome-note'>
              {t('app.onboarding.fields.welcomeNote.label')}
            </FieldLabel>
            <FieldContent>
              <FieldDescription>
                {t('app.onboarding.fields.welcomeNote.description')}
              </FieldDescription>
              <Textarea
                id='welcome-note'
                name='welcomeNote'
                placeholder={t('app.onboarding.fields.welcomeNote.placeholder')}
              />
            </FieldContent>
          </Field>

          <div className='flex flex-wrap items-center justify-between gap-3'>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li className='flex items-center gap-2'>
                <span
                  aria-hidden='true'
                  className='size-1.5 rounded-full bg-primary'
                />
                <span>{t('app.onboarding.checklist.chooseOrCreate')}</span>
              </li>
              <li className='flex items-center gap-2'>
                <span
                  aria-hidden='true'
                  className='size-1.5 rounded-full bg-primary'
                />
                <span>{t('app.onboarding.checklist.setCurrency')}</span>
              </li>
              <li className='flex items-center gap-2'>
                <span
                  aria-hidden='true'
                  className='size-1.5 rounded-full bg-primary'
                />
                <span>{t('app.onboarding.checklist.inviteLater')}</span>
              </li>
            </ul>

            <div className='flex flex-wrap items-center gap-3'>
              <Button asChild>
                <Link to='/app'>{t('app.onboarding.actions.backToShell')}</Link>
              </Button>
              <Button asChild variant='outline'>
                <Link to='/sign-in'>
                  {t('app.onboarding.actions.returnToSignIn')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </EmptyContent>
    </Empty>
  )
}

export { OnboardingPage }
