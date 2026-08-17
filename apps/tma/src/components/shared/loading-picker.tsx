import { NativePicker } from '@/components/shared/native-picker'

export const LoadingPicker = ({ loadingLabel }: { loadingLabel: string }) => (
  <NativePicker
    disabled
    fullWidth
    options={[{ label: loadingLabel, value: '' }]}
    value=''
    onChange={() => {}}
  />
)
