import { describe, expect, it } from 'vitest'

import { upsertUserByFirebaseIdentity } from '@/db/repositories/user-repository'

type UserRow = {
  id: string
  display_name: string | null
  primary_email: string | null
  avatar_url: string | null
}

type AuthIdentityRow = {
  id: string
  user_id: string
  provider: string
  provider_subject: string
  provider_email: string | null
  last_login_at: number
  created_at: number
  updated_at: number
}

type BatchState = {
  users: Map<string, UserRow>
  authIdentities: Map<string, AuthIdentityRow>
}

class FakePreparedStatement {
  constructor(
    private readonly db: FakeD1Database,
    private readonly sql: string,
  ) {}

  bind(...args: unknown[]) {
    return new FakeBoundStatement(this.db, this.sql, args)
  }
}

class FakeBoundStatement {
  constructor(
    private readonly db: FakeD1Database,
    private readonly sql: string,
    private readonly args: unknown[],
  ) {}

  async run() {
    return this.db.run(this.sql, this.args)
  }

  async first<T>() {
    return this.db.first<T>(this.sql, this.args)
  }
}

class FakeD1Database {
  private committedUsers = new Map<string, UserRow>()

  private committedAuthIdentities = new Map<string, AuthIdentityRow>()

  private externalAuthIdentities = new Map<string, AuthIdentityRow>()

  private batchState: BatchState | null = null

  private conflictInserted = false

  constructor(
    private readonly injectConflictIdentity: {
      id: string
      userId: string
      provider: string
      providerSubject: string
      providerEmail: string | null
    },
  ) {}

  seedUser(user: UserRow): void {
    this.committedUsers.set(user.id, { ...user })
  }

  getUserCount(): number {
    return this.committedUsers.size
  }

  getAuthIdentityCount(): number {
    return this.committedAuthIdentities.size + this.externalAuthIdentities.size
  }

  getUser(userId: string): UserRow | null {
    return this.committedUsers.get(userId) ?? null
  }

  prepare(sql: string) {
    return new FakePreparedStatement(this, sql)
  }

  async batch(
    statements: Array<{ run: () => Promise<unknown> }>,
  ): Promise<unknown[]> {
    if (this.batchState) {
      throw new Error('Nested batch operations are not supported in this test')
    }

    this.batchState = {
      users: new Map(this.committedUsers),
      authIdentities: new Map(this.committedAuthIdentities),
    }

    try {
      const results: unknown[] = []

      for (const statement of statements) {
        results.push(await statement.run())
      }

      this.committedUsers = this.batchState.users
      this.committedAuthIdentities = this.batchState.authIdentities

      return results
    } finally {
      this.batchState = null
    }
  }

  async exec(sql: string): Promise<void> {
    throw new Error(`Unsupported exec statement in this test: ${sql}`)
  }

  async run(
    sql: string,
    args: unknown[],
  ): Promise<{ meta: { changes: number } }> {
    if (/^INSERT\s+INTO\s+users/i.test(sql)) {
      const [id, displayName, primaryEmail, avatarUrl] = args as [
        string,
        string | null,
        string | null,
        string | null,
      ]

      this.workingUsers().set(id, {
        id,
        display_name: displayName,
        primary_email: primaryEmail,
        avatar_url: avatarUrl,
      })

      return { meta: { changes: 1 } }
    }

    if (/^INSERT\s+INTO\s+auth_identities/i.test(sql)) {
      this.insertConflictingWinnerIdentityIfNeeded()

      const [id, userId, provider, providerSubject, providerEmail] = args as [
        string,
        string,
        string,
        string,
        string | null,
      ]

      if (this.hasAuthIdentity(provider, providerSubject)) {
        throw new Error(
          'UNIQUE constraint failed: auth_identities.provider, auth_identities.provider_subject',
        )
      }

      this.workingAuthIdentities().set(id, {
        id,
        user_id: userId,
        provider,
        provider_subject: providerSubject,
        provider_email: providerEmail,
        last_login_at: Date.now(),
        created_at: Date.now(),
        updated_at: Date.now(),
      })

      return { meta: { changes: 1 } }
    }

    if (/^UPDATE\s+users/i.test(sql)) {
      const [displayName, primaryEmail, avatarUrl, updatedAt, userId] =
        args as [string | null, string | null, string | null, number, string]

      const user = this.workingUsers().get(userId)

      if (user) {
        this.workingUsers().set(userId, {
          ...user,
          display_name: displayName ?? user.display_name,
          primary_email: primaryEmail ?? user.primary_email,
          avatar_url: avatarUrl ?? user.avatar_url,
        })

        void updatedAt
      }

      return { meta: { changes: user ? 1 : 0 } }
    }

    if (/^UPDATE\s+auth_identities/i.test(sql)) {
      const [providerEmail, lastLoginAt, updatedAt, provider, providerSubject] =
        args as [string | null, number, number, string, string]

      const identityEntry = this.findAuthIdentityEntry(
        provider,
        providerSubject,
      )

      if (!identityEntry) {
        return { meta: { changes: 0 } }
      }

      identityEntry.store.set(identityEntry.id, {
        ...identityEntry.identity,
        provider_email: providerEmail ?? identityEntry.identity.provider_email,
        last_login_at: lastLoginAt,
        updated_at: updatedAt,
      })

      return { meta: { changes: 1 } }
    }

    if (/^DELETE\s+FROM\s+users/i.test(sql)) {
      const [userId] = args as [string]
      const deleted = this.workingUsers().delete(userId)

      return { meta: { changes: deleted ? 1 : 0 } }
    }

    throw new Error(`Unsupported SQL in fake database: ${sql}`)
  }

  async first<T>(sql: string, args: unknown[]): Promise<T | null> {
    if (/^SELECT\s+user_id\s+FROM\s+auth_identities/i.test(sql)) {
      const [provider, providerSubject] = args as [string, string]
      const identity = this.findAuthIdentity(provider, providerSubject)

      return identity ? ({ user_id: identity.user_id } as T) : null
    }

    if (
      /^SELECT\s+id,\s*display_name,\s*primary_email,\s*avatar_url\s+FROM\s+users/i.test(
        sql,
      )
    ) {
      const [userId] = args as [string]
      const user = this.workingUsers().get(userId)

      return user ? ({ ...user } as T) : null
    }

    throw new Error(`Unsupported SELECT in fake database: ${sql}`)
  }

  private workingUsers(): Map<string, UserRow> {
    return this.batchState?.users ?? this.committedUsers
  }

  private workingAuthIdentities(): Map<string, AuthIdentityRow> {
    return this.batchState?.authIdentities ?? this.committedAuthIdentities
  }

  private findAuthIdentity(
    provider: string,
    providerSubject: string,
  ): AuthIdentityRow | null {
    for (const identity of this.externalAuthIdentities.values()) {
      if (
        identity.provider === provider &&
        identity.provider_subject === providerSubject
      ) {
        return identity
      }
    }

    for (const identity of this.workingAuthIdentities().values()) {
      if (
        identity.provider === provider &&
        identity.provider_subject === providerSubject
      ) {
        return identity
      }
    }

    return null
  }

  private findAuthIdentityEntry(
    provider: string,
    providerSubject: string,
  ): {
    store: Map<string, AuthIdentityRow>
    id: string
    identity: AuthIdentityRow
  } | null {
    for (const [identityId, identity] of this.externalAuthIdentities) {
      if (
        identity.provider === provider &&
        identity.provider_subject === providerSubject
      ) {
        return {
          store: this.externalAuthIdentities,
          id: identityId,
          identity,
        }
      }
    }

    for (const [identityId, identity] of this.workingAuthIdentities()) {
      if (
        identity.provider === provider &&
        identity.provider_subject === providerSubject
      ) {
        return {
          store: this.workingAuthIdentities(),
          id: identityId,
          identity,
        }
      }
    }

    return null
  }

  private hasAuthIdentity(provider: string, providerSubject: string): boolean {
    return this.findAuthIdentity(provider, providerSubject) !== null
  }

  private insertConflictingWinnerIdentityIfNeeded(): void {
    if (this.conflictInserted) {
      return
    }

    this.conflictInserted = true

    this.externalAuthIdentities.set(this.injectConflictIdentity.id, {
      id: this.injectConflictIdentity.id,
      user_id: this.injectConflictIdentity.userId,
      provider: this.injectConflictIdentity.provider,
      provider_subject: this.injectConflictIdentity.providerSubject,
      provider_email: this.injectConflictIdentity.providerEmail,
      last_login_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    })
  }
}

describe('user repository', () => {
  it('rolls back the temporary user when the identity insert races', async () => {
    const db = new FakeD1Database({
      id: 'identity-winner',
      userId: 'winner-user',
      provider: 'firebase',
      providerSubject: 'firebase-subject-1',
      providerEmail: 'winner@example.com',
    })

    db.seedUser({
      id: 'winner-user',
      display_name: 'Original Winner',
      primary_email: 'winner@example.com',
      avatar_url: null,
    })

    const createdUser = await upsertUserByFirebaseIdentity(
      db as unknown as D1Database,
      {
        subject: 'firebase-subject-1',
        email: 'new@example.com',
        name: 'New Name',
        picture: 'https://example.com/avatar.png',
      },
    )

    expect(createdUser).toEqual({
      id: 'winner-user',
      displayName: 'New Name',
      primaryEmail: 'new@example.com',
      avatarUrl: 'https://example.com/avatar.png',
    })
    expect(db.getUserCount()).toBe(1)
    expect(db.getAuthIdentityCount()).toBe(1)
    expect(db.getUser('winner-user')).toEqual({
      id: 'winner-user',
      display_name: 'New Name',
      primary_email: 'new@example.com',
      avatar_url: 'https://example.com/avatar.png',
    })
  })
})
