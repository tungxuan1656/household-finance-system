import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const sourceRoot = join(process.cwd(), 'src')

const readSource = (path: string) =>
  readFileSync(join(sourceRoot, path), 'utf8')

describe('profile and more settings source contracts', () => {
  it('keeps More page as an icon shortcut list with package version footer', () => {
    const pageSource = readSource('views/app/more-page.tsx')
    const cardSource = readSource('views/app/more/more-shortcuts-card.tsx')

    expect(pageSource).toContain(
      "import { PageShell } from '@/components/ui/page-shell'",
    )

    expect(pageSource).toContain("<PageShell title={t('app.more.title')}")
    expect(pageSource).not.toContain('<header')
    expect(pageSource).not.toContain('<h1')
    expect(pageSource).toContain('MoreShortcutsCard')
    expect(pageSource).toContain("from '../../../../../package.json'")
    expect(pageSource).toContain('app.more.version')

    expect(cardSource).toContain('ArrowRight')
    expect(cardSource).toContain('LucideIcon')
    expect(cardSource).toContain('whitespace-normal')
    expect(cardSource).toContain('wrap-break-word')
    expect(cardSource).toContain('shrink-0')
    expect(cardSource).not.toContain('truncate')
    expect(cardSource).toContain('<Separator')
    expect(cardSource).not.toContain('⌘')
    expect(cardSource).not.toContain('shortcutKey')
  })

  it('keeps Profile Settings stacked without tabs or household memberships', () => {
    const source = readSource('views/app/profile-settings-page.tsx')

    expect(source).toContain(
      "import { PageShell } from '@/components/ui/page-shell'",
    )

    expect(source).toContain(
      "<PageShell title={t('shell.protected.nav.settings')}",
    )

    expect(source).not.toContain('<h1')
    expect(source).toContain('ProfileAvatarCard')
    expect(source).toContain('ProfileDetailsCard')
    expect(source).toContain('ProfilePasswordCard')
    expect(source).toContain('AccountActionsCard')
    expect(source).not.toContain('@/components/ui/tabs')
    expect(source).not.toContain('Tabs')
    expect(source).not.toContain('useHouseholdStore')
    expect(source).not.toContain('getHouseholdHref')
    expect(source).not.toContain('getHouseholdRoleLabel')
    expect(source).not.toContain('app.settings.memberships')
  })

  it('uses reusable confirm dialog for account actions', () => {
    const dialogSource = readSource('components/shared/confirm-dialog.tsx')
    const actionsSource = readSource(
      'views/app/profile-settings/account-actions-card.tsx',
    )

    expect(dialogSource).toContain('export type ConfirmDialogHandle')
    expect(dialogSource).toContain('open: () => void')
    expect(dialogSource).toContain('close: () => void')
    expect(dialogSource).toContain("variant?: 'default' | 'destructive'")
    expect(dialogSource).toContain('useImperativeHandle')
    expect(dialogSource).toContain('<AlertDialog')
    expect(dialogSource).toContain('<AlertDialogTitle')
    expect(dialogSource).toContain('<AlertDialogFooter')
    expect(dialogSource).not.toContain('@/components/ui/dialog')

    expect(actionsSource).toContain('ConfirmDialog')
    expect(actionsSource).toContain('signOutCurrentSession')
    expect(actionsSource).toContain('deleteCurrentUserAccount')
    expect(actionsSource).toContain('deleteAccountDialogReference')
    expect(actionsSource).toContain('danger zone')
    expect(actionsSource).toContain('ArrowRight')
    expect(actionsSource).toContain("variant='destructive'")
  })

  it('wires password change to Firebase without editing email', () => {
    const schemaSource = readSource('lib/forms/profile.schema.ts')
    const passwordCardSource = readSource(
      'views/app/profile-settings/profile-password-card.tsx',
    )
    const detailsSource = readSource(
      'views/app/profile-settings/profile-details-card.tsx',
    )
    const pageSource = readSource('views/app/profile-settings-page.tsx')

    expect(schemaSource).toContain('passwordChangeSchema')
    expect(schemaSource).toContain('PasswordChangeFormValues')
    expect(schemaSource).toContain('currentPassword')
    expect(schemaSource).toContain('newPassword')
    expect(schemaSource).not.toContain('confirmPassword')
    expect(schemaSource).not.toContain('refine')

    expect(passwordCardSource).toContain('passwordChangeSchema')
    expect(passwordCardSource).toContain('currentPassword')
    expect(passwordCardSource).toContain('newPassword')
    expect(passwordCardSource).toContain('changeCurrentUserPassword')
    expect(passwordCardSource).toContain('placeholder')
    expect(passwordCardSource).toContain('autoComplete=')

    expect(detailsSource).not.toContain('passwordChangeSchema')
    expect(detailsSource).not.toContain('confirmPassword')
    expect(detailsSource).not.toContain('refine')

    expect(pageSource).toContain('ProfilePasswordCard')

    expect(passwordCardSource).not.toContain('apiClient')
    expect(passwordCardSource).not.toContain('useMutation')
  })

  it('documents PageShell as the app page layout contract', () => {
    const frontendGuide = readFileSync(
      join(process.cwd(), '../../docs/FRONTEND.md'),
      'utf8',
    )

    expect(frontendGuide).toContain('## Page Shell Pattern')
    expect(frontendGuide).toContain('PageShell')
    expect(frontendGuide).toContain('route-level app pages')

    expect(frontendGuide).toContain(
      'docs/references/frontend/responsive-navigation-shell-pattern.md',
    )
  })
})
