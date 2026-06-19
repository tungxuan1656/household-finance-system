import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Textarea,
} from '@/components/ui'
import { useParseExpensesMutation } from '@/features/expenses/import-api'
import { useImportFlowStore } from '@/features/expenses/import-store'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  hideBottomButton,
  setBottomButton,
  updateBottomButton,
} from '@/lib/telegram/bottom-button'
import { notification } from '@/lib/telegram/haptics'

export const AddExpenseChatPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const rawText = useImportFlowStore((state) => state.rawText)
  const setRawText = useImportFlowStore((state) => state.setRawText)
  const setItems = useImportFlowStore((state) => state.setItems)
  const parseMutation = useParseExpensesMutation()
  const [error, setError] = useState<string | null>(null)

  const handleParse = async () => {
    if (!rawText.trim()) return

    setError(null)

    try {
      const defaultOccurredAt = new Date().toISOString().slice(0, 10)
      const response = await parseMutation.mutateAsync({
        text: rawText.trim(),
        defaultOccurredAt,
      })

      setItems(response.expenses)
      navigate(TMA_PATHS.expensesNewImport)
    } catch (err) {
      notification('error')

      setError(err instanceof Error ? err.message : t('expenses.add.saveError'))
    }
  }

  useEffect(() => {
    const cleanup = setBottomButton({
      text: t('expenses.add.parseAction'),
      enabled: false,
      showProgress: false,
      onClick: () => {
        void handleParse()
      },
    })

    return cleanup
  }, [t])

  // BottomButton lifecycle — visible on this screen only
  useEffect(() => {
    updateBottomButton({
      text: t('expenses.add.parseAction'),
      enabled: rawText.trim().length > 0 && !parseMutation.isPending,
      showProgress: parseMutation.isPending,
    })
  }, [!!rawText, parseMutation.isPending, t])

  // Clean up BottomButton on unmount
  useEffect(() => {
    return () => {
      hideBottomButton()
    }
  }, [])

  return (
    <TmaPageShell reserveBottomButton title={t('expenses.add.aiImportTitle')}>
      <Card className='mb-4'>
        <CardTitle>{t('expenses.add.aiImportDesc')}</CardTitle>
        <CardDescription>{t('expenses.add.aiImportHint')}</CardDescription>
      </Card>

      <Textarea
        aria-label={t('expenses.add.aiInputLabel')}
        className='min-h-45'
        disabled={parseMutation.isPending}
        placeholder={t('expenses.add.aiInputPlaceholder')}
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />

      {error ? (
        <Card className='mt-3 border-tma-error/20 bg-tma-error-bg/90'>
          <CardDescription className='text-tma-error'>{error}</CardDescription>
        </Card>
      ) : null}

      {parseMutation.isPending ? (
        <Card className='mt-3'>
          <CardDescription>{t('expenses.add.parsing')}</CardDescription>
        </Card>
      ) : null}

      <div className='mt-6'>
        <Button
          className='w-full'
          disabled={rawText.trim().length === 0}
          size='md'
          variant='outline'
          onClick={() => navigate(TMA_PATHS.expensesNewCategory)}>
          {t('expenses.add.switchToManual')}
        </Button>
      </div>
    </TmaPageShell>
  )
}
