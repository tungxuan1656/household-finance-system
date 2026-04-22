import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
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

const appNavItems = [
  { to: '/app', label: 'Overview' },
  { to: '/app/onboarding', label: 'Onboarding' },
  { to: '/app/expenses', label: 'Expenses' },
  { to: '/app/budgets', label: 'Budgets' },
  { to: '/app/insights', label: 'Insights' },
  { to: '/app/settings', label: 'Settings' },
] as const

const featureCards = [
  {
    title: 'Quick add',
    description:
      'Capture a transaction in a few seconds with defaults and clear validation.',
  },
  {
    title: 'Household context',
    description:
      'Keep the active household visible across expense, budget, and insight flows.',
  },
  {
    title: 'Shared primitives',
    description:
      'Reuse one form surface for auth, onboarding, and every future settings form.',
  },
] as const

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Navigate replace to='/sign-in' />} path='/' />
      <Route element={<PublicShell />}>
        <Route element={<SignInPage />} path='/sign-in' />
        <Route element={<SignUpPage />} path='/sign-up' />
      </Route>
      <Route element={<ProtectedShell />} path='/app'>
        <Route index element={<OverviewPage />} />
        <Route element={<OnboardingPage />} path='onboarding' />
        <Route element={<PlaceholderPage title='Expenses' />} path='expenses' />
        <Route element={<PlaceholderPage title='Budgets' />} path='budgets' />
        <Route element={<PlaceholderPage title='Insights' />} path='insights' />
        <Route element={<PlaceholderPage title='Settings' />} path='settings' />
      </Route>
      <Route element={<Navigate replace to='/sign-in' />} path='*' />
    </Routes>
  )
}

function PublicShell() {
  return (
    <div className='grid min-h-svh gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:p-8'>
      <section className='flex flex-col justify-between rounded-none border border-border/70 bg-background/85 p-6 shadow-sm backdrop-blur sm:p-8'>
        <div className='max-w-xl space-y-6'>
          <Badge className='w-fit' variant='outline'>
            Household finance shell
          </Badge>
          <div className='space-y-3'>
            <h1 className='font-heading text-3xl tracking-tight sm:text-5xl'>
              Track every shared expense without losing context.
            </h1>
            <p className='max-w-prose text-sm leading-6 text-muted-foreground sm:text-base'>
              Sign in, join a household, and move through the MVP flows from one
              stable web shell. The auth pages stay public while the app shell
              keeps onboarding, expenses, budgets, and insights consistent.
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-3'>
            {featureCards.map((card) => (
              <Card key={card.title} size='sm'>
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className='mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
          <span>Public routes: /sign-in, /sign-up</span>
          <span>Protected shell: /app</span>
          <span>Redirect: / → /sign-in</span>
        </div>
      </section>

      <main className='flex items-center justify-center'>
        <Outlet />
      </main>
    </div>
  )
}

function SignInPage() {
  return (
    <AuthPanel
      actionLabel='Sign in'
      description='Use your email address to continue into the household shell.'
      footer={
        <p>
          New here?{' '}
          <Link
            className='font-medium text-primary underline-offset-4 hover:underline'
            to='/sign-up'>
            Create an account
          </Link>
        </p>
      }
      title='Sign in'>
      <AuthField
        description='The inbox tied to your account.'
        id='email'
        label='Email address'>
        <Input
          autoComplete='email'
          id='email'
          name='email'
          placeholder='name@example.com'
          type='email'
        />
      </AuthField>

      <AuthField
        description='At least 8 characters.'
        id='password'
        label='Password'>
        <Input
          autoComplete='current-password'
          id='password'
          name='password'
          placeholder='••••••••'
          type='password'
        />
      </AuthField>
    </AuthPanel>
  )
}

function SignUpPage() {
  return (
    <AuthPanel
      actionLabel='Create account'
      description='Create the account that will later join or create a household.'
      footer={
        <p>
          Already have an account?{' '}
          <Link
            className='font-medium text-primary underline-offset-4 hover:underline'
            to='/sign-in'>
            Back to sign in
          </Link>
        </p>
      }
      title='Create your account'>
      <AuthField
        description='This is the name shown to your household.'
        id='full-name'
        label='Full name'>
        <Input
          autoComplete='name'
          id='full-name'
          name='fullName'
          placeholder='Alex Morgan'
        />
      </AuthField>

      <AuthField
        description='We will use this for the login flow.'
        id='sign-up-email'
        label='Email address'>
        <Input
          autoComplete='email'
          id='sign-up-email'
          name='email'
          placeholder='name@example.com'
          type='email'
        />
      </AuthField>

      <AuthField
        description='Choose a secure password for the app.'
        id='sign-up-password'
        label='Password'>
        <Input
          autoComplete='new-password'
          id='sign-up-password'
          name='password'
          placeholder='••••••••'
          type='password'
        />
      </AuthField>
    </AuthPanel>
  )
}

function AuthPanel({
  actionLabel,
  children,
  description,
  footer,
  title,
}: {
  actionLabel: string
  children: React.ReactNode
  description: string
  footer: React.ReactNode
  title: string
}) {
  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader>
        <p className='text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase'>
          Public route
        </p>
        <h1 className='font-heading text-2xl tracking-tight'>{title}</h1>
        <p className='text-xs/relaxed text-muted-foreground'>{description}</p>
      </CardHeader>
      <CardContent>
        <form className='space-y-5'>
          <div className='space-y-4'>{children}</div>
          <div className='flex flex-wrap items-center gap-3'>
            <Button type='submit'>{actionLabel}</Button>
            <Button asChild variant='outline'>
              <Link to='/app'>Continue as shell demo</Link>
            </Button>
          </div>
        </form>
        <div className='mt-4 text-xs text-muted-foreground'>{footer}</div>
      </CardContent>
    </Card>
  )
}

function AuthField({
  children,
  description,
  id,
  label,
}: {
  children: React.ReactNode
  description: string
  id: string
  label: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
        <FieldDescription>{description}</FieldDescription>
        {children}
      </FieldContent>
    </Field>
  )
}

function ProtectedShell() {
  return (
    <div className='min-h-svh p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto grid min-h-[calc(100svh-2rem)] max-w-7xl gap-4 lg:grid-cols-[240px_minmax(0,1fr)]'>
        <aside className='flex flex-col gap-4 rounded-none border border-border/70 bg-background/85 p-4 shadow-sm backdrop-blur'>
          <div className='space-y-2'>
            <Badge className='w-fit' variant='secondary'>
              Protected shell
            </Badge>
            <div>
              <h2 className='font-heading text-lg'>Shell navigation</h2>
              <p className='text-xs text-muted-foreground'>
                A stable frame for authenticated routes and onboarding.
              </p>
            </div>
          </div>

          <nav aria-label='App sections' className='flex flex-col gap-1'>
            {appNavItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-none px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')
                }
                to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className='mt-auto rounded-none border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground'>
            Auth state and household selection will plug in here in later feats.
          </div>
        </aside>

        <section className='space-y-4 rounded-none border border-border/70 bg-background/85 p-5 shadow-sm backdrop-blur sm:p-6'>
          <Outlet />
        </section>
      </div>
    </div>
  )
}

function OverviewPage() {
  return (
    <div className='space-y-6'>
      <header className='space-y-2'>
        <Badge variant='outline'>Signed-in shell</Badge>
        <h1 className='font-heading text-3xl tracking-tight'>
          Household workspace
        </h1>
        <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
          This landing page is a scaffold for the authenticated app state. It
          keeps the next features aligned on layout, navigation, and empty-state
          behavior before real data lands.
        </p>
      </header>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Active household</CardTitle>
            <CardDescription>
              Placeholder until household selection lands.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <p className='font-medium'>Demo Family</p>
            <p className='text-muted-foreground'>
              Single household context for shell demos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next action</CardTitle>
            <CardDescription>
              Guide the user into the right starting route.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Button asChild variant='outline'>
              <Link to='/app/onboarding'>Open onboarding</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shell coverage</CardTitle>
            <CardDescription>
              Routes that later features will replace.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 text-sm text-muted-foreground'>
            <p>
              Public auth pages, onboarding, dashboard, expenses, budgets,
              insights, and settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

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

function PlaceholderPage({ title }: { title: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <span aria-hidden='true'>▣</span>
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          This route is scaffolded for the MVP shell and will be replaced by the
          real feature in a later feat.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant='outline'>
          <Link to='/app'>Go back to the overview</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export { AppRoutes }
