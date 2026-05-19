import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { t } from '@/lib/i18n/t'

type HouseholdDangerZoneCardProps = { onArchive: () => Promise<void> }

export const HouseholdDangerZoneCard = ({
  onArchive,
}: HouseholdDangerZoneCardProps) => (
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
            {t('app.householdDetail.dangerZone.deleteSection.description')}
          </p>
        </div>
        <ConfirmDialog
          confirmLabel={t('app.householdDetail.deleteDialog.confirm')}
          description={t('app.householdDetail.deleteDialog.description')}
          title={t('app.householdDetail.deleteDialog.title')}
          trigger={
            <Button
              className='w-full'
              size={'sm'}
              type='button'
              variant='destructive'>
              {t('app.householdDetail.actions.delete')}
            </Button>
          }
          triggerClassName='w-full'
          variant='destructive'
          onConfirm={onArchive}
        />
      </div>
    </CardContent>
  </Card>
)
