import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ActionNotice, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui'
import { useCustomersQuery } from '../../queries'
import type { Customer, CustomerFilter, CustomerPromotion } from '../../services'
import { getCustomerPromotionTitle, normalizeCustomerFilter } from '../../utils'
import {
  CustomerDetailDialog,
  CustomerFilters,
  CustomerMetric,
  CustomersTable,
  GrantVoucherDialog,
} from './components'

const SAVE_FEEDBACK_DURATION_MS = 4500

interface GrantedVoucherNotice {
  customerId: string
  customerName: string
  voucherTitle: string
}

export const CustomersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const type = normalizeCustomerFilter(searchParams.get('type'))
  const search = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(search)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [grantingCustomer, setGrantingCustomer] = useState<Customer | null>(null)
  const [grantedNotice, setGrantedNotice] = useState<GrantedVoucherNotice | null>(null)
  const customersQuery = useCustomersQuery({ search, type })

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (!grantedNotice) return

    const timeoutId = window.setTimeout(() => {
      setGrantedNotice(null)
    }, SAVE_FEEDBACK_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [grantedNotice])

  const customers = useMemo(() => customersQuery.data ?? [], [customersQuery.data])
  const customersWithPhone = useMemo(() => customers.filter((customer) => customer.phone), [customers])
  const totalGrantedVouchers = useMemo(
    () => customers.reduce((total, customer) => total + customer.voucher_count, 0),
    [customers],
  )
  const totalUsedVouchers = useMemo(
    () => customers.reduce((total, customer) => total + customer.used_voucher_count, 0),
    [customers],
  )

  const updateFilters = (nextValues: { q?: string; type?: CustomerFilter }) => {
    const nextParams = new URLSearchParams(searchParams)
    const nextSearch = nextValues.q ?? search
    const nextType = nextValues.type ?? type

    if (nextSearch.trim()) {
      nextParams.set('q', nextSearch.trim())
    } else {
      nextParams.delete('q')
    }

    if (nextType !== 'all') {
      nextParams.set('type', nextType)
    } else {
      nextParams.delete('type')
    }

    setSearchParams(nextParams)
  }

  const handleVoucherGranted = (customer: Customer, userPromotion: CustomerPromotion) => {
    setGrantedNotice({
      customerId: customer.id,
      customerName: customer.display_name,
      voucherTitle: getCustomerPromotionTitle(userPromotion),
    })
  }

  const scrollToGrantedCustomer = () => {
    if (!grantedNotice) return

    document
      .querySelector(`[data-customer-row-id="${grantedNotice.customerId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Khách hàng</p>
        <h2 className="mt-2 text-3xl font-black text-ink">Quản lý khách hàng</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Quản lý hồ sơ khách từ customer_profiles và cấp voucher cá nhân theo Zalo user id.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <CustomerMetric label="Tổng khách" value={customers.length} />
        <CustomerMetric label="Có SĐT" value={customersWithPhone.length} />
        <CustomerMetric label="Voucher đã cấp" value={totalGrantedVouchers} />
        <CustomerMetric label="Voucher đã dùng" value={totalUsedVouchers} />
      </section>

      {grantedNotice ? (
        <ActionNotice
          tone="success"
          title={`Đã cấp voucher cho “${grantedNotice.customerName}”`}
          description={grantedNotice.voucherTitle}
          primaryAction={{
            label: 'Xem trong danh sách',
            onClick: scrollToGrantedCustomer,
          }}
          onDismiss={() => setGrantedNotice(null)}
        />
      ) : null}

      <Card>
        <CardHeader className="flex-col gap-4 xl:flex-row">
          <div>
            <CardTitle>Danh sách khách hàng</CardTitle>
            <CardDescription>Tìm kiếm theo tên, số điện thoại, Zalo ID và cấp voucher cá nhân.</CardDescription>
          </div>
          <CustomerFilters
            searchInput={searchInput}
            type={type}
            onSearchInputChange={setSearchInput}
            onSubmitSearch={() => updateFilters({ q: searchInput })}
            onTypeChange={(value) => updateFilters({ type: value })}
          />
        </CardHeader>
        <CardContent>
          <CustomersTable
            customers={customers}
            isLoading={customersQuery.isLoading}
            isError={customersQuery.isError}
            highlightedCustomerId={grantedNotice?.customerId}
            onRetry={() => void customersQuery.refetch()}
            onView={setSelectedCustomer}
            onGrantVoucher={setGrantingCustomer}
          />
        </CardContent>
      </Card>

      {selectedCustomer ? (
        <CustomerDetailDialog
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onGrantVoucher={setGrantingCustomer}
        />
      ) : null}

      {grantingCustomer ? (
        <GrantVoucherDialog
          customer={grantingCustomer}
          onClose={() => setGrantingCustomer(null)}
          onGranted={handleVoucherGranted}
        />
      ) : null}
    </div>
  )
}
