import type { ReactNode } from 'react'

export interface TmaDataStateProps {
  children?: ReactNode
  className?: string
  customAction?: ReactNode
  emptyDescription?: string
  emptyTitle?: string
  errorDescription?: string
  errorTitle?: string
  isEmpty?: boolean
  isError?: boolean
  isLoading?: boolean
  loadingDescription?: string
  loadingTitle?: string
  retryAction?: () => unknown | Promise<unknown>
}

const DEFAULT_LOADING_TITLE = 'Đang tải dữ liệu'
const DEFAULT_LOADING_DESCRIPTION =
  'Nội dung sẽ xuất hiện ngay khi truy vấn hoàn tất.'
const DEFAULT_EMPTY_TITLE = 'Không có dữ liệu'
const DEFAULT_EMPTY_DESCRIPTION = 'Hiện chưa có dữ liệu để hiển thị ở mục này.'
const DEFAULT_ERROR_TITLE = 'Không thể tải dữ liệu'
const DEFAULT_ERROR_DESCRIPTION = 'Đã có lỗi xảy ra, vui lòng thử lại sau.'

export const TmaDataState = ({
  children,
  className = 'tma-empty-card',
  customAction,
  emptyDescription = DEFAULT_EMPTY_DESCRIPTION,
  emptyTitle = DEFAULT_EMPTY_TITLE,
  errorDescription = DEFAULT_ERROR_DESCRIPTION,
  errorTitle = DEFAULT_ERROR_TITLE,
  isEmpty,
  isError,
  isLoading,
  loadingDescription = DEFAULT_LOADING_DESCRIPTION,
  loadingTitle = DEFAULT_LOADING_TITLE,
  retryAction,
}: TmaDataStateProps) => {
  if (isLoading) {
    return (
      <div className={className}>
        <h2>{loadingTitle}</h2>
        {loadingDescription ? <p>{loadingDescription}</p> : null}
      </div>
    )
  }

  if (isError || isEmpty) {
    const title = isError ? errorTitle : emptyTitle
    const description = isError ? errorDescription : emptyDescription
    const action =
      customAction ??
      (isError && retryAction ? (
        <button
          className='tma-action-button tma-action-button--ghost'
          type='button'
          onClick={() => {
            void retryAction()
          }}>
          Thử lại
        </button>
      ) : null)

    return (
      <div className={className}>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {action ? <div className='tma-action-row'>{action}</div> : null}
      </div>
    )
  }

  return <>{children}</>
}
