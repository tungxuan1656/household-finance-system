#!/usr/bin/env node
// Migrate external personal-finance transactions into the household-finance system
// via the backend migration endpoints.
//
// Modes (mutually exclusive):
//   1) Token mode (default): POST /api/v1/migrate/expenses — uses Bearer JWT.
//   2) Internal/admin mode: POST /api/v1/internal/migrate/expenses — uses X-Internal-Api-Key.
//
// Usage:
//   node scripts/migrate-expenses.mjs <transactions-file> [options]
//
// Options (token mode — default):
//   --token <token>          Access token (JWT). Falls back to ACCESS_TOKEN env var.
//
// Options (internal mode):
//   --target-user-id <id>    Target user ID to create expenses for (implies internal mode).
//   --admin-secret <secret>  Internal API key. Falls back to INTERNAL_API_KEY env var.
//
// General options:
//   --remote                 Target the remote deployed worker instead of local.
//   --dry-run                Validate + count without persisting.
//   --household-id <id>      Scope to a household (omit for personal).
//   --source-key <key>       Override default sourceKey 'bank-transfer'.
//   --show-errors <n>        Number of per-entry errors to print (default 20, 0 = all).
//   --help, -h               Show this help.
//
// Examples:
//   # Token mode: dry-run preview
//   node scripts/migrate-expenses.mjs resources/transactions-personal.json --token <JWT> --dry-run
//
//   # Internal mode: migrate for another user
//   node scripts/migrate-expenses.mjs resources/transactions-personal.json --target-user-id <id> --admin-secret <secret>
//
//   # Token mode with ACCESS_TOKEN env var
//   ACCESS_TOKEN=<JWT> node scripts/migrate-expenses.mjs resources/transactions-personal.json
//
//   # Internal mode with INTERNAL_API_KEY env var
//   INTERNAL_API_KEY=<secret> node scripts/migrate-expenses.mjs resources/transactions-personal.json --target-user-id <id>

import { readFileSync } from 'node:fs'
import process from 'node:process'

const LOCAL_TOKEN_URL = 'http://localhost:8787/api/v1/migrate/expenses'
const REMOTE_TOKEN_URL =
  'https://household-finance-system.tungxuan-work10.workers.dev/api/v1/migrate/expenses'

const LOCAL_INTERNAL_URL =
  'http://localhost:8787/api/v1/internal/migrate/expenses'
const REMOTE_INTERNAL_URL =
  'https://household-finance-system.tungxuan-work10.workers.dev/api/v1/internal/migrate/expenses'

const printHelp = () => {
  console.log(`Migrate external transactions into the household-finance system.

Usage:
  node scripts/migrate-expenses.mjs <transactions-file> [options]

Modes (mutually exclusive):
  Token mode (default)       POST /api/v1/migrate/expenses using Bearer JWT
  Internal/admin mode         POST /api/v1/internal/migrate/expenses using X-Internal-Api-Key
  (--target-user-id <id>)

Options (token mode — default):
  --token <token>            Access token (JWT). Falls back to ACCESS_TOKEN env var.

Options (internal mode):
  --target-user-id <id>      Target user ID to create expenses for (implies internal mode).
  --admin-secret <secret>    Internal API key. Falls back to INTERNAL_API_KEY env var.

General options:
  --remote                   Target the remote deployed worker instead of local.
  --dry-run                  Validate + count without persisting.
  --household-id <id>        Scope to a household (omit for personal).
  --source-key <key>         Override default sourceKey 'bank-transfer'.
  --show-errors <n>          Number of per-entry errors to print (default 20, 0 = all).
  --help, -h                 Show this help.

Target URLs:
  Token  mode: ${LOCAL_TOKEN_URL}
  Internal mode: ${LOCAL_INTERNAL_URL}
  Remote (--remote): prepend remote base to the chosen endpoint path.

The transactions file must be the external nested JSON shape:
  { "<dateKey>": { "<txId>": { categoryId, date, money, note } } }
It is sent verbatim as the request body's "transactions" field.`)
}

const parseArgs = (argv) => {
  const opts = {
    file: null,
    token: null,
    remote: false,
    dryRun: false,
    householdId: null,
    sourceKey: null,
    showErrors: 20,
    help: false,
    targetUserId: null,
    adminSecret: null,
  }
  const args = argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    switch (a) {
      case '--help':
      case '-h':
        opts.help = true
        break
      case '--remote':
        opts.remote = true
        break
      case '--dry-run':
        opts.dryRun = true
        break
      case '--token':
        opts.token = args[++i]
        break
      case '--household-id':
        opts.householdId = args[++i]
        break
      case '--source-key':
        opts.sourceKey = args[++i]
        break
      case '--show-errors':
        opts.showErrors = Number.parseInt(args[++i], 10)
        break
      case '--target-user-id':
        opts.targetUserId = args[++i]
        break
      case '--admin-secret':
        opts.adminSecret = args[++i]
        break
      default:
        if (a.startsWith('--')) {
          throw new Error(`Unknown option: ${a}`)
        }
        if (!opts.file) {
          opts.file = a
        } else {
          throw new Error(`Unexpected positional argument: ${a}`)
        }
    }
  }
  return opts
}

const formatBreakdown = (b) => {
  const lines = []
  const labels = {
    income: 'income (money > 0)',
    zero: 'zero (money = 0)',
    nonExpenseCategory: 'non-expense category kind',
    blankNote: 'blank note',
    invalidDate: 'invalid date',
    unknownCategory: 'unknown external categoryId',
    error: 'create failed',
  }
  for (const [key, label] of Object.entries(labels)) {
    if (b[key]) lines.push(`    ${label}: ${b[key]}`)
  }
  // Surface any unexpected keys too.
  for (const [key, val] of Object.entries(b)) {
    if (!(key in labels) && val) lines.push(`    ${key}: ${val}`)
  }
  return lines.length ? lines.join('\n') : '    (none)'
}

const main = async () => {
  const opts = parseArgs(process.argv)

  if (opts.help) {
    printHelp()
    process.exit(0)
  }

  if (!opts.file) {
    console.error('Error: <transactions-file> is required.')
    console.error('Run with --help for usage.')
    process.exit(2)
  }

  if (opts.targetUserId && opts.token) {
    console.error(
      'Error: --token cannot be combined with --target-user-id. Choose token mode or internal mode.',
    )
    process.exit(2)
  }

  if (opts.adminSecret && !opts.targetUserId) {
    console.error(
      'Error: --admin-secret requires --target-user-id. Choose internal mode explicitly.',
    )
    process.exit(2)
  }

  // Determine mode: internal if targetUserId is provided, else token mode
  const isInternal = Boolean(opts.targetUserId)

  if (isInternal) {
    const secret = opts.adminSecret || process.env.INTERNAL_API_KEY
    if (!secret) {
      console.error(
        'Error: internal mode requires --admin-secret <secret> or INTERNAL_API_KEY env var.',
      )
      process.exit(2)
    }
    opts._resolvedSecret = secret
  } else {
    const token = opts.token || process.env.ACCESS_TOKEN
    if (!token) {
      console.error(
        'Error: token mode requires --token <JWT> or ACCESS_TOKEN env var.',
      )
      process.exit(2)
    }
    opts._resolvedToken = token
  }

  // Read + parse the transactions file.
  let transactions
  try {
    const raw = readFileSync(opts.file, 'utf8')
    transactions = JSON.parse(raw)
  } catch (e) {
    console.error(
      `Error reading/parsing transactions file "${opts.file}": ${e.message}`,
    )
    process.exit(2)
  }

  if (
    typeof transactions !== 'object' ||
    transactions === null ||
    Array.isArray(transactions)
  ) {
    console.error(
      'Error: transactions file must be a JSON object (nested dateKey -> txId -> tx).',
    )
    process.exit(2)
  }

  const url = isInternal
    ? opts.remote
      ? REMOTE_INTERNAL_URL
      : LOCAL_INTERNAL_URL
    : opts.remote
      ? REMOTE_TOKEN_URL
      : LOCAL_TOKEN_URL

  // Build request body — only include optional fields when provided.
  const body = { transactions }
  if (opts.dryRun) body.dryRun = true
  if (opts.householdId) body.householdId = opts.householdId
  if (opts.sourceKey) body.sourceKey = opts.sourceKey
  if (isInternal) body.targetUserId = opts.targetUserId

  const totalEntries = Object.values(transactions).reduce(
    (sum, txMap) =>
      sum +
      (txMap && typeof txMap === 'object' ? Object.keys(txMap).length : 0),
    0,
  )

  // Build headers — never print secrets
  const headers = { 'content-type': 'application/json' }
  if (isInternal) {
    headers['x-internal-api-key'] = opts._resolvedSecret
  } else {
    headers.authorization = `Bearer ${opts._resolvedToken}`
  }

  console.log('Migrate expenses')
  console.log(`  mode:       ${isInternal ? 'internal' : 'token'}`)
  console.log(`  target:     ${opts.remote ? 'remote' : 'local'} (${url})`)
  console.log(`  file:       ${opts.file}`)
  console.log(`  entries:    ${totalEntries}`)
  console.log(`  dry-run:    ${opts.dryRun ? 'yes' : 'no'}`)
  console.log(
    `  scope:      ${opts.householdId ? `household ${opts.householdId}` : 'personal'}`,
  )
  if (isInternal) {
    console.log(`  target-user: ${opts.targetUserId}`)
  }
  if (opts.sourceKey) console.log(`  source-key: ${opts.sourceKey}`)
  console.log('')

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  } catch (e) {
    console.error(`Network error calling ${url}: ${e.message}`)
    console.error(
      opts.remote
        ? 'Check your network connection and that the remote worker is reachable.'
        : 'Is the local worker running? Start it with: pnpm --filter worker dev',
    )
    process.exit(1)
  }

  const payload = await res.json().catch(() => null)

  if (!res.ok || !payload || payload.success !== true) {
    console.error(`Request failed: HTTP ${res.status}`)
    if (payload && payload.error) {
      console.error(`  code:    ${payload.error.code}`)
      console.error(`  message: ${payload.error.message}`)
      if (payload.error.details)
        console.error(`  details: ${JSON.stringify(payload.error.details)}`)
    } else if (payload) {
      console.error(`  body: ${JSON.stringify(payload)}`)
    } else {
      console.error(`  body: <non-JSON or empty>`)
    }
    process.exit(1)
  }

  const data = payload.data
  console.log('Result')
  console.log(`  created:  ${data.created}`)
  console.log(`  skipped:  ${data.skipped}`)
  console.log(`  dry-run:  ${data.dryRun ? 'yes' : 'no'}`)
  console.log('  skipped breakdown:')
  console.log(formatBreakdown(data.skippedBreakdown || {}))

  const errors = data.errors || []
  if (errors.length > 0) {
    console.log(`  per-entry errors: ${errors.length}`)
    const limit = opts.showErrors === 0 ? errors.length : opts.showErrors
    const shown = errors.slice(0, limit)
    for (const e of shown) {
      console.log(`    [${e.date} / ${e.txId}] ${e.reason}`)
    }
    if (errors.length > shown.length) {
      console.log(
        `    ... and ${errors.length - shown.length} more (use --show-errors 0 to see all)`,
      )
    }
  } else {
    console.log('  per-entry errors: 0')
  }

  if (payload.meta && payload.meta.requestId) {
    console.log(`  request-id: ${payload.meta.requestId}`)
  }

  console.log('')
  if (data.dryRun) {
    console.log(
      'Dry-run complete — nothing was persisted. Re-run without --dry-run to import.',
    )
  } else {
    console.log(`Migration complete: ${data.created} expense(s) created.`)
  }
}

main().catch((e) => {
  console.error(`Fatal: ${e && e.message ? e.message : e}`)
  process.exit(1)
})
