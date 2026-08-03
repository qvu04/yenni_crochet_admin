import {
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineGift,
  AiOutlineLoading3Quarters,
} from 'react-icons/ai'
import { Badge, Button } from '../../../components/ui'
import type { Product } from '../../../services'
import { formatCurrency, getProductInventory, getProductLabel } from '../../../utils'
import { ProductThumbnail } from './ProductThumbnail'

interface ProductsTableProps {
  products: Product[]
  isLoading: boolean
  isError: boolean
  isTogglingActive: boolean
  highlightedProductId?: string | null
  onRetry: () => void
  onEdit: (product: Product) => void
  onToggleActive: (product: Product) => void
}

export const ProductsTable = ({
  products,
  isLoading,
  isError,
  isTogglingActive,
  highlightedProductId,
  onRetry,
  onEdit,
  onToggleActive,
}: ProductsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-admin border border-dashed border-berry/20 bg-cream py-14 text-sm font-bold text-muted">
        <AiOutlineLoading3Quarters className="mr-2 animate-spin text-xl text-berry" />
        Đang tải sản phẩm...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-admin border border-berry/20 bg-berry/10 p-5">
        <p className="font-black text-berry">Không tải được sản phẩm</p>
        <p className="mt-1 text-sm text-muted">Kiểm tra lại quyền admin hoặc cấu trúc bảng products.</p>
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Tải lại
        </Button>
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-5 py-14 text-center">
        <AiOutlineGift className="mx-auto text-4xl text-berry" />
        <p className="mt-3 font-black text-ink">Chưa có sản phẩm phù hợp</p>
        <p className="mt-1 text-sm text-muted">Thử đổi bộ lọc hoặc thêm sản phẩm mới.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-admin border border-berry/10">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-cream text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Sản phẩm</th>
            <th className="px-4 py-3">Loại</th>
            <th className="px-4 py-3">Giá bán</th>
            <th className="px-4 py-3">Giá sỉ</th>
            <th className="px-4 py-3">Tồn kho</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-berry/10 bg-white">
          {products.map((product) => (
            <tr
              key={product.id}
              data-product-row-id={product.id}
              className={product.id === highlightedProductId ? 'bg-mint/60 transition-colors' : 'transition-colors'}
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <ProductThumbnail product={product} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-black text-ink">{product.name}</p>
                      {product.id === highlightedProductId ? <Badge tone="success">Vừa lưu</Badge> : null}
                    </div>
                    <p className="mt-1 truncate text-xs font-bold text-muted">
                      {product.estimated_days || 'Chưa nhập thời gian làm'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <Badge tone={product.is_pre_order ? 'info' : 'neutral'}>{getProductLabel(product)}</Badge>
              </td>
              <td className="px-4 py-4 font-black text-ink">{formatCurrency(product.price)}</td>
              <td className="px-4 py-4 text-muted">
                {product.product_price_tiers?.filter((tier) => tier.is_active).length || 0} mức
              </td>
              <td className="px-4 py-4 font-black text-ink">{getProductInventory(product)}</td>
              <td className="px-4 py-4">
                <Badge tone={product.is_active ? 'success' : 'danger'}>
                  {product.is_active ? 'Đang bán' : 'Đã ẩn'}
                </Badge>
              </td>
              <td className="px-4 py-4">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(product)}>
                    <AiOutlineEdit className="text-lg" />
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant={product.is_active ? 'danger' : 'secondary'}
                    disabled={isTogglingActive}
                    onClick={() => onToggleActive(product)}
                  >
                    {product.is_active ? <AiOutlineEyeInvisible className="text-lg" /> : <AiOutlineEye className="text-lg" />}
                    {product.is_active ? 'Ẩn' : 'Bật'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
