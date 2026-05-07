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

type HouseholdDangerZoneCardProps = {
  onArchive: () => Promise<void>
}

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
            <AlertDialogFooter className='flex-col sm:flex-row'>
              <AlertDialogCancel>
                {t('common.actions.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                variant='destructive'
                onClick={() => void onArchive()}>
                {t('app.householdDetail.deleteDialog.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardContent>
  </Card>
)
