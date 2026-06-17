import { parseBudgetInputToMinor, parseOptionalDateInput } from './presentation'

export type CreateGroupInput = {
  budgetInput: string
  description: string
  endDate: string
  name: string
  startDate: string
}

export type CreateGroupValidationError = { message: string; tone: 'error' }

export const validateCreateGroupInput = (
  input: CreateGroupInput,
  t: (key: string) => string,
): CreateGroupValidationError | null => {
  const normalizedName = input.name.trim()
  const normalizedDescription = input.description.trim()
  const parsedStartDate = parseOptionalDateInput(input.startDate)
  const parsedEndDate = parseOptionalDateInput(input.endDate)
  const parsedBudget = parseBudgetInputToMinor(input.budgetInput)

  if (!normalizedName) {
    return {
      message: t('groups.createPage.validation.nameRequired'),
      tone: 'error',
    }
  }

  if (normalizedName.length > 200) {
    return {
      message: t('groups.createPage.validation.nameMaxLength'),
      tone: 'error',
    }
  }

  if (normalizedDescription.length > 1000) {
    return {
      message: t('groups.createPage.validation.descriptionMaxLength'),
      tone: 'error',
    }
  }

  if (
    parsedStartDate !== undefined &&
    parsedEndDate !== undefined &&
    parsedEndDate < parsedStartDate
  ) {
    return {
      message: t('groups.createPage.validation.endBeforeStart'),
      tone: 'error',
    }
  }

  if (parsedBudget !== undefined && parsedBudget <= 0) {
    return {
      message: t('groups.createPage.validation.budgetPositive'),
      tone: 'error',
    }
  }

  if (parsedBudget !== undefined && parsedBudget > 999_999_999_999) {
    return {
      message: t('groups.createPage.validation.budgetTooLarge'),
      tone: 'error',
    }
  }

  return null
}
