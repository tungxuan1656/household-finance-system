// @ts-ignore
const migrationFiles = import.meta.glob('../../migrations/*.sql', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

type ParsedMigration = {
  filePath: string
  fileName: string
  order: number
  sql: string
}

const MIGRATION_FILE_PATTERN = /^(\d+)_([a-z0-9_]+)\.sql$/

const parseMigrations = (): ParsedMigration[] => {
  const rawPaths = Object.keys(migrationFiles)

  if (rawPaths.length === 0) {
    throw new Error('No SQL migrations found for test bootstrap.')
  }

  const parsed = rawPaths.map((filePath) => {
    const fileName = filePath.split('/').at(-1) ?? filePath
    const match = MIGRATION_FILE_PATTERN.exec(fileName)

    if (!match) {
      throw new Error(
        `Invalid migration file name: ${fileName}. Expected format: 0001_name.sql`,
      )
    }

    return {
      filePath,
      fileName,
      order: Number(match[1]),
      sql: migrationFiles[filePath],
    }
  })

  parsed.sort((left, right) => left.order - right.order)

  for (let index = 1; index < parsed.length; index += 1) {
    if (parsed[index - 1].order === parsed[index].order) {
      throw new Error(
        `Duplicate migration order detected: ${parsed[index - 1].fileName} and ${parsed[index].fileName}`,
      )
    }
  }

  return parsed
}

export const applyMigrations = async (db: D1Database): Promise<void> => {
  const migrations = parseMigrations()

  for (const migration of migrations) {
    const statements: string[] = []
    const lines = migration.sql.split('\n')
    let buffer: string[] = []
    let inTrigger = false

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.length === 0) {
        continue
      }

      buffer.push(line)

      if (!inTrigger && /^CREATE\s+TRIGGER/i.test(trimmed)) {
        inTrigger = true
      }

      if (inTrigger) {
        if (/^END;$/i.test(trimmed)) {
          statements.push(buffer.join('\n'))
          buffer = []
          inTrigger = false
        }

        continue
      }

      if (trimmed.endsWith(';')) {
        statements.push(buffer.join('\n'))
        buffer = []
      }
    }

    if (buffer.length > 0) {
      statements.push(buffer.join('\n'))
    }

    for (const statement of statements) {
      await db.prepare(statement).run()
    }
  }
}
