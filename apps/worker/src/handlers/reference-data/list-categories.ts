import type { ListCategoriesResponse } from '@/contracts'
import { listReferenceCategories } from '@/lib/reference-data/catalog'

export const listCategories = (): ListCategoriesResponse => ({
  items: listReferenceCategories(),
})
