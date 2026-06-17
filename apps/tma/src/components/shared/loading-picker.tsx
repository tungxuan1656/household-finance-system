import { NativePicker } from '@/components/ui/native-picker'

export const LoadingPicker = ({ loadingLabel }: { loadingLabel: string }) => (
  <NativePicker
    disabled
    fullWidth
    options={[{ label: loadingLabel, value: '' }]}
    value=''
    onChange={() => {}}
  />
)
