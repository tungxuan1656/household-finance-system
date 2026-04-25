import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PATHS } from '@/lib/constants/paths'
import {
  type CreateHouseholdFormValues,
  createHouseholdSchema,
} from '@/lib/forms/household.schema'
import { t } from '@/lib/i18n'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const isLoading = useHouseholdStore.use.isLoading()
  const error = useHouseholdStore.use.error()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<CreateHouseholdFormValues>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(createHouseholdSchema),
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
    })
  }, [currentHousehold, form])

  const handleUpdate = async (values: CreateHouseholdFormValues) => {
    if (!id) {
      return
    }

    try {
      await householdActions.updateHousehold(id, values)
      setIsEditing(false)
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
    } catch {
      toast.error(t('app.householdDetail.feedback.archiveFailed'))
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
        <Card>
          <CardHeader>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='flex flex-col gap-1'>
                <CardTitle>{currentHousehold.name}</CardTitle>
                <CardDescription>
                  {t('app.householdDetail.memberCountPlaceholder')}
                </CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Badge variant='secondary'>{currentHousehold.role}</Badge>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsEditing(true)}>
                  {t('app.householdDetail.actions.edit')}
                </Button>
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
            </div>
          </CardHeader>
          <CardContent />
        </Card>
      ) : null}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className='sm:max-w-md' showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {t('app.householdDetail.editDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {t('app.householdDetail.editDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <form
            className='flex flex-col gap-5'
            onSubmit={form.handleSubmit(handleUpdate)}>
            <FieldGroup>
              <Controller
                control={form.control}
                name='name'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='detail-household-name'>
                      {t('app.householdDetail.fields.householdName.label')}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id='detail-household-name'
                        placeholder={t(
                          'app.householdDetail.fields.householdName.placeholder',
                        )}
                      />
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
            <DialogFooter>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setIsEditing(false)}>
                {t('common.actions.cancel')}
              </Button>
              <Button disabled={isLoading} type='submit'>
                {t('app.householdDetail.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='flex flex-col gap-1'>
              <CardTitle>{t('app.householdDetail.members.title')}</CardTitle>
              <CardDescription>
                {t('app.householdDetail.members.description')}
              </CardDescription>
            </div>
            <Button type='button' variant='outline'>
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
                  <td className='px-3 py-2'>Owner (placeholder)</td>
                  <td className='px-3 py-2'>
                    <Badge variant='secondary'>admin</Badge>
                  </td>
                  <td className='px-3 py-2'>
                    <Button size='sm' type='button' variant='outline'>
                      {t('app.householdDetail.members.actions.remove')}
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className='px-3 py-2'>Member (placeholder)</td>
                  <td className='px-3 py-2'>
                    <Badge variant='secondary'>member</Badge>
                  </td>
                  <td className='px-3 py-2'>
                    <Button size='sm' type='button' variant='outline'>
                      {t('app.householdDetail.members.actions.remove')}
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { HouseholdDetailPage }
