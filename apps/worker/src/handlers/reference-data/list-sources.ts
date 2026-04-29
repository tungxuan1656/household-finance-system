import type { ListSourcesResponse } from '@/contracts'
import { listReferenceSources } from '@/lib/reference-data/catalog'

export const listSources = (): ListSourcesResponse => ({
  items: listReferenceSources(),
})
