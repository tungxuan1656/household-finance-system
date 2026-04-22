import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

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

export { PlaceholderPage }
