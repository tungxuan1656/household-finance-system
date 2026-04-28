import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Separator } from '@/components/ui/separator'
import { PATHS } from '@/lib/constants/paths'
import {
  type UpdateHouseholdSettingsFormValues,
  updateHouseholdSettingsSchema,
} from '@/lib/forms/household.schema'
import { t } from '@/lib/i18n'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

const isConflictError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }

  return (
    error.message.toLowerCase().includes('conflict') ||
    error.message.toLowerCase().includes('thành viên')
  )
}

function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const isLoading = useHouseholdStore.use.isLoading()
  const error = useHouseholdStore.use.error()

  const form = useForm<UpdateHouseholdSettingsFormValues>({
    defaultValues: {
      name: '',
      timezone: '',
      defaultVisibility: undefined,
    },
    resolver: zodResolver(updateHouseholdSettingsSchema),
  })

  useEffect(() => {
    if (!id) {
      return
    }

    void householdActions.fetchHouseholdById(id)
  }, [id])

  useEffect(() => {
    if (!currentHousehold) {
      return
    }

    form.reset({
      name: currentHousehold.name,
      timezone: currentHousehold.timezone,
      defaultVisibility: currentHousehold.defaultVisibility,
    })
  }, [currentHousehold, form])

  const handleSaveSettings = async (
    values: UpdateHouseholdSettingsFormValues,
  ) => {
    if (!id) {
      return
    }

    try {
      await householdActions.updateHousehold(id, values)
      toast.success(t('app.householdDetail.feedback.updateSuccess'))
    } catch {
      toast.error(t('app.householdDetail.feedback.updateFailed'))
    }
  }

  const handleArchive = async () => {
    if (!id) {
      return
    }

    try {
      await householdActions.archiveHousehold(id)
      toast.success(t('app.householdDetail.feedback.archiveSuccess'))
      navigate(PATHS.HOUSEHOLDS, { replace: true })
    } catch (error) {
      if (isConflictError(error)) {
        toast.error(t('app.householdDetail.feedback.archiveBlockedByMembers'))
      } else {
        toast.error(t('app.householdDetail.feedback.archiveFailed'))
      }
    }
  }

  if (!id) {
    return (
      <p className='text-sm text-muted-foreground'>
        {t('app.householdDetail.invalidId')}
      </p>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('app.householdDetail.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('app.householdDetail.description')}
          </p>
        </div>
        <Button asChild variant='outline'>
          <Link to={PATHS.HOUSEHOLDS}>
            {t('app.householdDetail.actions.back')}
          </Link>
        </Button>
      </header>

      {isLoading ? (
        <Card>
          <CardContent className='pt-1 text-sm text-muted-foreground'>
            {t('app.householdDetail.loading')}
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && error ? (
        <Card>
          <CardContent className='flex items-center justify-between gap-2 pt-1'>
            <p className='text-sm text-destructive'>{error}</p>
            <Button
              type='button'
              variant='outline'
              onClick={() => void householdActions.fetchHouseholdById(id)}>
              {t('app.householdDetail.actions.retry')}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && currentHousehold ? (
        <>
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex flex-col gap-1'>
                  <CardTitle>{currentHousehold.name}</CardTitle>
                  <CardDescription>
                    {t('app.householdDetail.memberCountPlaceholder')}
                  </CardDescription>
                </div>
                <Badge variant='secondary'>{currentHousehold.role}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form
                className='flex flex-col gap-5'
                onSubmit={form.handleSubmit(handleSaveSettings)}>
                <FieldGroup>
                  {/* Household Name */}
                  <Controller
                    control={form.control}
                    name='name'
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='settings-household-name'>
                          {t('app.householdDetail.fields.householdName.label')}
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            id='settings-household-name'
                            placeholder={t(
                              'app.householdDetail.fields.householdName.placeholder',
                            )}
                          />
                          <FieldDescription>
                            {t(
                              'app.householdDetail.fields.householdName.description',
                            )}
                          </FieldDescription>
                          {fieldState.invalid ? (
                            <FieldError errors={[fieldState.error]} />
                          ) : null}
                        </FieldContent>
                      </Field>
                    )}
                  />

                  {/* Timezone */}
                  <Controller
                    control={form.control}
                    name='timezone'
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='settings-timezone'>
                          {t('app.householdDetail.fields.timezone.label')}
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            id='settings-timezone'
                            placeholder={t(
                              'app.householdDetail.fields.timezone.placeholder',
                            )}
                          />
                          <FieldDescription>
                            {t(
                              'app.householdDetail.fields.timezone.description',
                            )}
                          </FieldDescription>
                          {fieldState.invalid ? (
                            <FieldError errors={[fieldState.error]} />
                          ) : null}
                        </FieldContent>
                      </Field>
                    )}
                  />

                  {/* Default Visibility */}
                  <Controller
                    control={form.control}
                    name='defaultVisibility'
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='settings-default-visibility'>
                          {t(
                            'app.householdDetail.fields.defaultVisibility.label',
                          )}
                        </FieldLabel>
                        <FieldContent>
                          <NativeSelect
                            aria-invalid={fieldState.invalid}
                            id='settings-default-visibility'
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value

                              field.onChange(
                                val === 'private' || val === 'household'
                                  ? val
                                  : undefined,
                              )
                            }}>
                            <NativeSelectOption value='private'>
                              {t(
                                'app.householdDetail.fields.defaultVisibility.options.private',
                              )}
                            </NativeSelectOption>
                            <NativeSelectOption value='household'>
                              {t(
                                'app.householdDetail.fields.defaultVisibility.options.household',
                              )}
                            </NativeSelectOption>
                          </NativeSelect>
                          <FieldDescription>
                            {t(
                              'app.householdDetail.fields.defaultVisibility.description',
                            )}
                          </FieldDescription>
                          {fieldState.invalid ? (
                            <FieldError errors={[fieldState.error]} />
                          ) : null}
                        </FieldContent>
                      </Field>
                    )}
                  />
                </FieldGroup>

                <div className='flex justify-end'>
                  <Button disabled={isLoading} type='submit'>
                    {t('app.householdDetail.actions.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Members Card */}
          <Card>
            <CardHeader>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='flex flex-col gap-1'>
                  <CardTitle>
                    {t('app.householdDetail.members.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('app.householdDetail.members.description')}
                  </CardDescription>
                </div>
                {/* TODO(feat-members): Enable invite action when member-management API is implemented. */}
                <Button disabled type='button' variant='outline'>
                  {t('app.householdDetail.members.actions.invite')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* TODO(feat-members): Replace placeholder rows with real household members API integration. */}
              {/* TODO(feat-members): Wire invite and remove actions to invitation/member-management endpoints. */}
              <div className='overflow-x-auto rounded-lg border'>
                <table className='min-w-full text-sm'>
                  <thead className='border-b bg-muted/40 text-left text-muted-foreground'>
                    <tr>
                      <th className='px-3 py-2 font-medium'>
                        {t('app.householdDetail.members.columns.name')}
                      </th>
                      <th className='px-3 py-2 font-medium'>
                        {t('app.householdDetail.members.columns.role')}
                      </th>
                      <th className='px-3 py-2 font-medium'>
                        {t('app.householdDetail.members.columns.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='border-b'>
                      <td className='px-3 py-2'>
                        {t('app.householdDetail.members.placeholders.owner')}
                      </td>
                      <td className='px-3 py-2'>
                        <Badge variant='secondary'>admin</Badge>
                      </td>
                      <td className='px-3 py-2'>
                        {/* TODO(feat-members): Enable remove action when member-management API is implemented. */}
                        <Button
                          disabled
                          size='sm'
                          type='button'
                          variant='outline'>
                          {t('app.householdDetail.members.actions.remove')}
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className='px-3 py-2'>
                        {t('app.householdDetail.members.placeholders.member')}
                      </td>
                      <td className='px-3 py-2'>
                        <Badge variant='secondary'>member</Badge>
                      </td>
                      <td className='px-3 py-2'>
                        {/* TODO(feat-members): Enable remove action when member-management API is implemented. */}
                        <Button
                          disabled
                          size='sm'
                          type='button'
                          variant='outline'>
                          {t('app.householdDetail.members.actions.remove')}
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className='border-destructive/40'>
            <CardHeader>
              <CardTitle className='text-destructive'>
                {t('app.householdDetail.dangerZone.title')}
              </CardTitle>
              <CardDescription>
                {t('app.householdDetail.dangerZone.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className='mb-4' />
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex flex-col gap-1'>
                  <p className='text-sm font-medium'>
                    {t('app.householdDetail.dangerZone.deleteSection.label')}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {t(
                      'app.householdDetail.dangerZone.deleteSection.description',
                    )}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type='button' variant='destructive'>
                      {t('app.householdDetail.actions.delete')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('app.householdDetail.deleteDialog.title')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('app.householdDetail.deleteDialog.description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t('common.actions.cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant='destructive'
                        onClick={() => void handleArchive()}>
                        {t('app.householdDetail.deleteDialog.confirm')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

export { HouseholdDetailPage }
