import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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

export { OverviewPage }
