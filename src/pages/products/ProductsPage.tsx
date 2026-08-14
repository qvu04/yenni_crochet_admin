import { useEffect, useMemo, useState } from 'react'
import { AiOutlinePlus } from 'react-icons/ai'
import { useSearchParams } from 'react-router-dom'
import { ActionNotice, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, getPaginatedItems, TablePagination } from '../../components/ui'
import { useProductActiveMutation, useProductsQuery } from '../../queries'
import type { Product, ProductTypeFilter } from '../../services'
import { getProductInventory, normalizeProductType } from '../../utils'
import {
  ProductFilters,
  ProductFormDialog,
  ProductMetric,
  ProductsTable,
} from './components'

const SAVE_FEEDBACK_DURATION_MS = 4500

interface SavedProductNotice {
  id: string
  name: string
  action: 'created' | 'updated'
  isVisibleInCurrentView: boolean
}

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const type = normalizeProductType(searchParams.get('type'))
  const search = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(search)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [savedNotice, setSavedNotice] = useState<SavedProductNotice | null>(null)
  const productsQuery = useProductsQuery({ search, type })
  const activeMutation = useProductActiveMutation()

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])
  const { items: paginatedProducts } = getPaginatedItems(products, currentPage, pageSize)
  const activeProducts = useMemo(() => products.filter((product) => product.is_active), [products])
  const totalInventory = useMemo(
    () => products.reduce((total, product) => total + getProductInventory(product), 0),
    [products],
  )
  const visibleProductIds = useMemo(() => new Set(products.map((product) => product.id)), [products])

  useEffect(() => {
    if (!savedNotice) return

    const timeoutId = window.setTimeout(() => {
      setSavedNotice(null)
    }, SAVE_FEEDBACK_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [savedNotice])

  useEffect(() => {
    if (!savedNotice) return

    const nextVisibility = visibleProductIds.has(savedNotice.id)
    if (savedNotice.isVisibleInCurrentView !== nextVisibility) {
      setSavedNotice((currentNotice) =>
        currentNotice ? { ...currentNotice, isVisibleInCurrentView: nextVisibility } : currentNotice,
      )
    }
  }, [savedNotice, visibleProductIds])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, type, pageSize])

  const updateFilters = (nextValues: { q?: string; type?: ProductTypeFilter }) => {
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

  const openCreateForm = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const openEditForm = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleProductSaved = (product: Product, action: 'created' | 'updated') => {
    setSavedNotice({
      id: product.id,
      name: product.name,
      action,
      isVisibleInCurrentView: visibleProductIds.has(product.id),
    })
  }

  const scrollToSavedProduct = () => {
    if (!savedNotice) return

    document
      .querySelector(`[data-product-row-id="${savedNotice.id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Sản phẩm</p>
          <h2 className="mt-2 text-3xl font-black text-ink">Quản lý sản phẩm</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Thêm, cập nhật thông tin bán hàng, ảnh sản phẩm, giá sỉ và phân loại tồn kho.
          </p>
        </div>
        <Button variant="secondary" onClick={openCreateForm}>
          <AiOutlinePlus className="text-xl" />
          Thêm sản phẩm
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ProductMetric label="Tổng sản phẩm" value={products.length} />
        <ProductMetric label="Đang bật bán" value={activeProducts.length} />
        <ProductMetric label="Tổng tồn kho" value={totalInventory} />
      </section>

      {savedNotice ? (
        <ActionNotice
          tone="success"
          title={`${savedNotice.action === 'created' ? 'Đã thêm sản phẩm' : 'Đã cập nhật sản phẩm'} “${savedNotice.name}”`}
          description={
            savedNotice.isVisibleInCurrentView
              ? 'Sản phẩm đã được đánh dấu trong danh sách bên dưới.'
              : 'Sản phẩm đã lưu thành công nhưng không nằm trong bộ lọc hiện tại.'
          }
          primaryAction={
            savedNotice.isVisibleInCurrentView
              ? {
                  label: 'Xem trong danh sách',
                  onClick: scrollToSavedProduct,
                }
              : undefined
          }
          onDismiss={() => setSavedNotice(null)}
        />
      ) : null}

      <Card>
        <CardHeader className="flex-col gap-4 xl:flex-row">
          <div>
            <CardTitle>Danh sách sản phẩm</CardTitle>
            <CardDescription>Tìm kiếm theo tên và lọc theo nhóm hiển thị trên shop.</CardDescription>
          </div>
          <ProductFilters
            searchInput={searchInput}
            type={type}
            onSearchInputChange={setSearchInput}
            onSubmitSearch={() => updateFilters({ q: searchInput })}
            onTypeChange={(value) => updateFilters({ type: value })}
          />
        </CardHeader>
        <CardContent>
          <ProductsTable
            products={paginatedProducts}
            isLoading={productsQuery.isLoading}
            isError={productsQuery.isError}
            isTogglingActive={activeMutation.isPending}
            highlightedProductId={savedNotice?.isVisibleInCurrentView ? savedNotice.id : null}
            onRetry={() => void productsQuery.refetch()}
            onEdit={openEditForm}
            onToggleActive={(product) => activeMutation.mutate({ productId: product.id, isActive: !product.is_active })}
          />
          <TablePagination
            totalItems={products.length}
            currentPage={currentPage}
            pageSize={pageSize}
            itemLabel="sản phẩm"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {isFormOpen ? (
        <ProductFormDialog
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleProductSaved}
        />
      ) : null}
    </div>
  )
}
