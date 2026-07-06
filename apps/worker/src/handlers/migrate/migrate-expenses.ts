import type { Context } from 'hono'

import type {
  InternalMigrateExpensesRequest,
  MigrateExpensesRequest,
  MigrateExpensesResultDTO,
} from '@/contracts'
import {
  internalMigrateExpensesRequestSchema,
  migrateExpensesRequestSchema,
} from '@/contracts/migrate-schemas'
import { findUserById } from '@/db/repositories/user-repository'
import { notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'

import { runMigration } from './shared'

type MigrateHandlerCtx = Context<AppBindings>

export const migrateExpensesHandler = async (
  ctx: MigrateHandlerCtx,
): Promise<MigrateExpensesResultDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const body = await readJsonBody<MigrateExpensesRequest>(
    ctx.req.raw,
    migrateExpensesRequestSchema(),
    locale,
  )

  return runMigration(db, locale, body, currentUser.id)
}

export const internalMigrateExpensesHandler = async (
  ctx: MigrateHandlerCtx,
): Promise<MigrateExpensesResultDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const db = ctx.env.DB

  const body = await readJsonBody<InternalMigrateExpensesRequest>(
    ctx.req.raw,
    internalMigrateExpensesRequestSchema(),
    locale,
  )

  // Validate target user exists
  const targetUser = await findUserById(db, body.targetUserId)

  if (!targetUser) {
    throw notFound(locale, 'errors.userNotFound')
  }

  const migrateBody: MigrateExpensesRequest = {
    transactions: body.transactions,
    householdId: body.householdId,
    sourceKey: body.sourceKey,
    categoryMapping: body.categoryMapping,
    dryRun: body.dryRun,
  }

  return runMigration(db, locale, migrateBody, body.targetUserId)
}
