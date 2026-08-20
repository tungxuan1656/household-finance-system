import { useEffectEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useParseExpensesMutation } from '@/features/expenses/import-api'
import { MAX_PARSE_TEXT_LENGTH } from '@/features/expenses/import-api'
import { useImportFlowStore } from '@/features/expenses/import-store'
import { TMA_PATHS } from '@/lib/constants/routes'
import { notification } from '@/lib/telegram/haptics'

export const AddExpenseChatPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const rawText = useImportFlowStore((state) => state.rawText)
  const setRawText = useImportFlowStore((state) => state.setRawText)
  const setItems = useImportFlowStore((state) => state.setItems)
  const parseMutation = useParseExpensesMutation()
  const [error, setError] = useState<string | null>(null)

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

  return (
    <TmaPageShell title={t('expenses.add.aiImportTitle')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.add.aiImportDesc')}</CardTitle>
          <CardDescription>{t('expenses.add.aiImportHint')}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.add.aiInputLabel')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='add-expense-chat-input'>
                {t('expenses.add.aiInputLabel')}
              </FieldLabel>
              <Textarea
                aria-label={t('expenses.add.aiInputLabel')}
                className='max-h-[60vh] min-h-90'
                disabled={parseMutation.isPending}
                id='add-expense-chat-input'
                maxLength={MAX_PARSE_TEXT_LENGTH}
                placeholder={t('expenses.add.aiInputPlaceholder')}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent>
            <CardDescription>{error}</CardDescription>
          </CardContent>
        </Card>
      ) : null}

      {parseMutation.isPending ? (
        <Card>
          <CardContent>
            <CardDescription>{t('expenses.add.parsing')}</CardDescription>
          </CardContent>
        </Card>
      ) : null}

      <TmaHapticButton
        aria-busy={parseMutation.isPending}
        className='mt-4 mb-2 w-full'
        disabled={!rawText.trim() || parseMutation.isPending}
        onClick={() => {
          void handleParse()
        }}>
        {parseMutation.isPending
          ? t('expenses.add.parsing')
          : t('expenses.add.parseAction')}
      </TmaHapticButton>
    </TmaPageShell>
  )
}
