export const SummaryRow = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div className='grid gap-1'>
    <span className='text-[11px] font-bold tracking-[0.04em] text-tma-text-muted uppercase'>
      {label}
    </span>
    <strong className='text-sm text-tma-text-strong'>{value}</strong>
  </div>
)
