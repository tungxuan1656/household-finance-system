import { Card, CardDescription, CardHeader } from '@/components/ui/card'

import type { BudgetFeedback } from '../types'

type BudgetFeedbackCardProps = {
  feedback: BudgetFeedback
}

export const BudgetFeedbackCard = ({ feedback }: BudgetFeedbackCardProps) => (
  <Card size='sm'>
    <CardHeader>
      <CardDescription
        className={
          feedback.tone === 'error' ? 'text-destructive' : 'text-emerald-600'
        }>
        {feedback.message}
      </CardDescription>
    </CardHeader>
  </Card>
)
