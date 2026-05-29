'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ActionCardProps = {
  title?: string
  description?: string
  actionIcon?: ReactNode
  actionTitle: string
  actionDescription: string
  actionLabel: string
  onAction: () => void
}

export const ActionCard = ({
  title,
  description,
  actionIcon,
  actionTitle,
  actionDescription,
  actionLabel,
  onAction,
}: ActionCardProps) => {
  return (
    <Card className='h-fit'>
      {title || description ? (
        <CardHeader>
          {title ? <CardTitle>{title}</CardTitle> : null}
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent>
        <div className='flex flex-col items-center gap-4 rounded-xl border border-dashed p-6 text-center'>
          {actionIcon && <div aria-hidden='true'>{actionIcon}</div>}
          <div className='flex flex-col gap-1'>
            <p className='text-sm font-medium'>{actionTitle}</p>
            <p className='text-xs text-muted-foreground'>{actionDescription}</p>
          </div>
          <Button type='button' onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
