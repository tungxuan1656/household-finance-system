import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { getGroupDateRangeLabel, getGroupStatusLabel } from '../presentation'
import type { ExpenseGroupDTO } from '../types'
import { GroupGlyph } from './group-glyph'

type GroupHeroCardProps = {
  group: ExpenseGroupDTO
  contextLabel: string
}

export const GroupHeroCard = ({ group, contextLabel }: GroupHeroCardProps) => {
  const { t } = useTranslation()

  return (
    <Card size='sm'>
      <CardHeader className='gap-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='grid min-w-0 gap-1'>
            <CardDescription className='truncate text-xs'>
              {contextLabel}
            </CardDescription>
            <CardTitle className='text-xl leading-tight font-extrabold tracking-tight normal-case'>
              {group.name}
            </CardTitle>
            {group.description ? (
              <CardDescription className='mt-1 line-clamp-2 text-sm'>
                {group.description}
              </CardDescription>
            ) : null}
          </div>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <GroupGlyph />
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex flex-wrap gap-2'>
        <Badge variant='secondary'>
          {getGroupStatusLabel(group.status, t)}
        </Badge>
        <Badge variant='outline'>{getGroupDateRangeLabel(group, t)}</Badge>
      </CardContent>
    </Card>
  )
}
