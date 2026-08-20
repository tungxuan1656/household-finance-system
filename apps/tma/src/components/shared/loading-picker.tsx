import { NativePicker } from '@/components/shared/native-picker'

export const LoadingPicker = ({
  id,
  loadingLabel,
}: {
  id?: string
  loadingLabel: string
}) => (
  <NativePicker
    disabled
    fullWidth
    id={id}
    options={[{ label: loadingLabel, value: '' }]}
    value=''
    onChange={() => {}}
  />
)
