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

function OnboardingPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <span aria-hidden='true'>✨</span>
        </EmptyMedia>
        <h1 className='font-heading text-2xl tracking-tight'>
          Finish setting up your household
        </h1>
        <EmptyDescription>
          This placeholder keeps the onboarding entry point visible until the
          dedicated flow is built.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className='grid w-full gap-4 rounded-none border border-border/70 bg-background/70 p-4 text-left backdrop-blur sm:p-5'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Field>
              <FieldLabel htmlFor='household-name'>Household name</FieldLabel>
              <FieldContent>
                <FieldDescription>
                  Shown across the shell until the real onboarding flow is
                  ready.
                </FieldDescription>
                <Input
                  id='household-name'
                  name='householdName'
                  placeholder='Demo Family'
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor='currency'>Default currency</FieldLabel>
              <FieldContent>
                <FieldDescription>
                  Choose the currency the shell should assume by default.
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
            <FieldLabel htmlFor='welcome-note'>Welcome note</FieldLabel>
            <FieldContent>
              <FieldDescription>
                Optional copy that will eventually appear in the onboarding
                confirmation.
              </FieldDescription>
              <Textarea
                id='welcome-note'
                name='welcomeNote'
                placeholder='Add a short note for the household...'
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
                <span>Choose or create a household</span>
              </li>
              <li className='flex items-center gap-2'>
                <span
                  aria-hidden='true'
                  className='size-1.5 rounded-full bg-primary'
                />
                <span>Set your default currency</span>
              </li>
              <li className='flex items-center gap-2'>
                <span
                  aria-hidden='true'
                  className='size-1.5 rounded-full bg-primary'
                />
                <span>Invite members later if needed</span>
              </li>
            </ul>

            <div className='flex flex-wrap items-center gap-3'>
              <Button asChild>
                <Link to='/app'>Back to shell</Link>
              </Button>
              <Button asChild variant='outline'>
                <Link to='/sign-in'>Return to sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </EmptyContent>
    </Empty>
  )
}

export { OnboardingPage }
