import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ActionNotice, Card, CardContent, CardDescription, CardHeader, CardTitle, getPaginatedItems, TablePagination } from '../../components/ui'
import { useCustomRequestsQuery } from '../../queries'
import type { CustomRequest, CustomRequestStatusFilter } from '../../services'
import { customRequestStatusLabels, normalizeCustomRequestStatus } from '../../utils'
import {
  CustomRequestDetailDialog,
  CustomRequestFilters,
  CustomRequestMetric,
  CustomRequestsTable,
} from './components'

const SAVE_FEEDBACK_DURATION_MS = 4500

interface SavedCustomRequestNotice {
  id: string
  customerName: string
  statusLabel: string
}

export const CustomRequestsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = normalizeCustomRequestStatus(searchParams.get('status'))
  const search = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(search)
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [savedNotice, setSavedNotice] = useState<SavedCustomRequestNotice | null>(null)
  const customRequestsQuery = useCustomRequestsQuery({ search, status })

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (!savedNotice) return

    const timeoutId = window.setTimeout(() => {
      setSavedNotice(null)
    }, SAVE_FEEDBACK_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [savedNotice])

  const requests = useMemo(() => customRequestsQuery.data ?? [], [customRequestsQuery.data])
  const { items: paginatedRequests } = getPaginatedItems(requests, currentPage, pageSize)
  const pendingRequests = useMemo(() => requests.filter((request) => request.status === 'pending'), [requests])
  const contactedRequests = useMemo(() => requests.filter((request) => request.status === 'contacted'), [requests])
  const completedRequests = useMemo(() => requests.filter((request) => request.status === 'completed'), [requests])

  const updateFilters = (nextValues: { q?: string; status?: CustomRequestStatusFilter }) => {
    const nextParams = new URLSearchParams(searchParams)
    const nextSearch = nextValues.q ?? search
    const nextStatus = nextValues.status ?? status

    if (nextSearch.trim()) {
      nextParams.set('q', nextSearch.trim())
    } else {
      nextParams.delete('q')
    }

    if (nextStatus !== 'all') {
      nextParams.set('status', nextStatus)
    } else {
      nextParams.delete('status')
    }

    setSearchParams(nextParams)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [search, status, pageSize])

  const handleRequestSaved = (request: CustomRequest) => {
    setSavedNotice({
      id: request.id,
      customerName: request.customer_name,
      statusLabel: customRequestStatusLabels[request.status],
    })
  }

  const scrollToSavedRequest = () => {
    if (!savedNotice) return

    document
      .querySelector(`[data-custom-request-row-id="${savedNotice.id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Đặt riêng</p>
        <h2 className="mt-2 text-3xl font-black text-ink">Yêu cầu đặt riêng</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Theo dõi các yêu cầu tư vấn, ảnh mẫu, tone màu, số lượng và cập nhật tiến độ liên hệ.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <CustomRequestMetric label="Tổng yêu cầu" value={requests.length} />
        <CustomRequestMetric label="Chưa liên hệ" value={pendingRequests.length} />
        <CustomRequestMetric label="Đã liên hệ" value={contactedRequests.length} />
        <CustomRequestMetric label="Hoàn thành" value={completedRequests.length} />
      </section>

      {savedNotice ? (
        <ActionNotice
          tone="success"
          title={`Đã cập nhật yêu cầu của “${savedNotice.customerName}”`}
          description={`Trạng thái mới: ${savedNotice.statusLabel}.`}
          primaryAction={{
            label: 'Xem trong danh sách',
            onClick: scrollToSavedRequest,
          }}
          onDismiss={() => setSavedNotice(null)}
        />
      ) : null}

      <Card>
        <CardHeader className="flex-col gap-4 xl:flex-row">
          <div>
            <CardTitle>Danh sách yêu cầu</CardTitle>
            <CardDescription>Lọc theo trạng thái và tìm nhanh theo khách, số điện thoại hoặc mô tả.</CardDescription>
          </div>
          <CustomRequestFilters
            searchInput={searchInput}
            status={status}
            onSearchInputChange={setSearchInput}
            onSubmitSearch={() => updateFilters({ q: searchInput })}
            onStatusChange={(value) => updateFilters({ status: value })}
          />
        </CardHeader>
        <CardContent>
          <CustomRequestsTable
            requests={paginatedRequests}
            isLoading={customRequestsQuery.isLoading}
            isError={customRequestsQuery.isError}
            highlightedRequestId={savedNotice?.id}
            onRetry={() => void customRequestsQuery.refetch()}
            onView={setSelectedRequest}
          />
          <TablePagination
            totalItems={requests.length}
            currentPage={currentPage}
            pageSize={pageSize}
            itemLabel="yêu cầu"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {selectedRequest ? (
        <CustomRequestDetailDialog
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSaved={handleRequestSaved}
        />
      ) : null}
    </div>
  )
}
