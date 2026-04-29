import { HouseholdInviteDialog } from '@/components/household/household-invite-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { t } from '@/lib/i18n/t'

type HouseholdMembersCardProps = {
  householdId: string
}

export const HouseholdMembersCard = ({
  householdId,
}: HouseholdMembersCardProps) => (
  <Card>
    <CardHeader>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-col gap-1'>
          <CardTitle>{t('app.householdDetail.members.title')}</CardTitle>
          <CardDescription>
            {t('app.householdDetail.members.description')}
          </CardDescription>
        </div>
        <HouseholdInviteDialog householdId={householdId} />
      </div>
    </CardHeader>
    <CardContent>
      {/* TODO(feat-members): Replace placeholder rows with real household members API integration. */}
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
                <Button disabled size='sm' type='button' variant='outline'>
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
                <Button disabled size='sm' type='button' variant='outline'>
                  {t('app.householdDetail.members.actions.remove')}
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
)
