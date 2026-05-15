import type { TranslationKey } from '@/lib/i18n/i18n-init'
import { t } from '@/lib/i18n/t'
import type { CategoryKey, SourceKey } from '@/types/reference-data'

const CATEGORY_LABEL_KEYS: Record<CategoryKey, TranslationKey> = {
  food: 'app.expenseReference.categories.food',
  transport: 'app.expenseReference.categories.transport',
  dating: 'app.expenseReference.categories.dating',
  'living-costs': 'app.expenseReference.categories.living-costs',
  family: 'app.expenseReference.categories.family',
  children: 'app.expenseReference.categories.children',
  relatives: 'app.expenseReference.categories.relatives',
  shopping: 'app.expenseReference.categories.shopping',
  beauty: 'app.expenseReference.categories.beauty',
  health: 'app.expenseReference.categories.health',
  social: 'app.expenseReference.categories.social',
  repairs: 'app.expenseReference.categories.repairs',
  work: 'app.expenseReference.categories.work',
  education: 'app.expenseReference.categories.education',
  investment: 'app.expenseReference.categories.investment',
  'self-development': 'app.expenseReference.categories.self-development',
  sports: 'app.expenseReference.categories.sports',
  travel: 'app.expenseReference.categories.travel',
  hobbies: 'app.expenseReference.categories.hobbies',
  pets: 'app.expenseReference.categories.pets',
  'money-in': 'app.expenseReference.categories.money-in',
  lending: 'app.expenseReference.categories.lending',
  charity: 'app.expenseReference.categories.charity',
  other: 'app.expenseReference.categories.other',
}

const SOURCE_LABEL_KEYS: Record<SourceKey, TranslationKey> = {
  cash: 'app.expenseReference.sources.cash',
  'bank-transfer': 'app.expenseReference.sources.bank-transfer',
  card: 'app.expenseReference.sources.card',
  momo: 'app.expenseReference.sources.momo',
  'zalo-pay': 'app.expenseReference.sources.zalo-pay',
  'shopee-pay': 'app.expenseReference.sources.shopee-pay',
  other: 'app.expenseReference.sources.other',
}

export const getCategoryLabel = (key: CategoryKey): string =>
  t(CATEGORY_LABEL_KEYS[key])

export const getSourceLabel = (key: SourceKey): string =>
  t(SOURCE_LABEL_KEYS[key])
