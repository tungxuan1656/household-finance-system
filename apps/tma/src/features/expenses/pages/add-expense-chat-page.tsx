import { useEffectEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageFooter, TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  MAX_PARSE_TEXT_LENGTH,
  useParseExpensesMutation,
} from '@/features/expenses/import-api'
import { useImportFlowStore } from '@/features/expenses/model/import-store'
import { TMA_PATHS } from '@/lib/constants/routes'
import { notification } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

export const AddExpenseChatPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const rawText = useImportFlowStore((state) => state.rawText)
  const setRawText = useImportFlowStore((state) => state.setRawText)
  const setItems = useImportFlowStore((state) => state.setItems)
  const parseMutation = useParseExpensesMutation()
  const [error, setError] = useState<string | null>(null)

  const isPending = parseMutation.isPending

  const handleParse = useEffectEvent(async () => {
    if (!rawText.trim()) return

    setError(null)

    try {
      const defaultOccurredAt = new Date().toISOString().slice(0, 10)
      const response = await parseMutation.mutateAsync({
        text: rawText.trim(),
        defaultOccurredAt,
      })

      if (response.expenses.length === 0) {
        notification('warning')
        setError(t('expenses.add.parseEmpty'))

        return
      }

      setItems(response.expenses)
      navigate(TMA_PATHS.expensesNewImport)
    } catch (err) {
      notification('error')

      setError(
        err instanceof Error && err.message
          ? err.message
          : t('expenses.add.parseError'),
      )
    }
  })

  const isNearLimit = rawText.length > MAX_PARSE_TEXT_LENGTH * 0.9
  const isOverLimit = rawText.length >= MAX_PARSE_TEXT_LENGTH

  return (
    <TmaPageShell
      contentClassName='gap-4'
      footer={
        <TmaPageFooter>
          <TmaHapticButton
            aria-busy={isPending}
            disabled={!rawText.trim() || isPending}
            variant='default'
            onClick={() => {
              void handleParse()
            }}>
            {isPending
              ? t('expenses.add.parsing')
              : t('expenses.add.parseAction')}
          </TmaHapticButton>
        </TmaPageFooter>
      }
      title={t('expenses.add.aiImportTitle')}>
      <Card>
        <CardHeader className='gap-1.5'>
          <CardTitle className='text-base'>
            {t('expenses.add.aiImportDesc')}
          </CardTitle>
          <CardDescription className='text-sm'>
            {t('expenses.add.aiImportHint')}
          </CardDescription>
        </CardHeader>

        <CardContent className='flex flex-col gap-3'>
          <Textarea
            aria-invalid={Boolean(error)}
            aria-label={t('expenses.add.aiInputLabel')}
            className='max-h-[50vh] min-h-50 resize-y text-base md:text-sm'
            disabled={isPending}
            id='add-expense-chat-input'
            maxLength={MAX_PARSE_TEXT_LENGTH}
            placeholder={t('expenses.add.aiInputPlaceholder')}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />

          <div className='flex items-start justify-between gap-3'>
            <div className='min-h-5 min-w-0 flex-1'>
              {isPending ? (
                <span className='inline-flex items-center gap-2 text-sm text-muted-foreground'>
                  <span
                    aria-hidden='true'
                    className='size-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground'
                  />
                  {t('expenses.add.parsing')}
                </span>
              ) : error ? (
                <p
                  className='text-sm leading-snug font-medium text-destructive'
                  role='alert'>
                  {error}
                </p>
              ) : null}
            </div>

            <span
              className={cn(
                'shrink-0 text-xs tabular-nums',
                isOverLimit
                  ? 'font-medium text-destructive'
                  : isNearLimit
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground',
              )}>
              {rawText.length}/{MAX_PARSE_TEXT_LENGTH}
            </span>
          </div>
        </CardContent>
      </Card>
    </TmaPageShell>
  )
}
