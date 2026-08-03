import { AiOutlineGift } from 'react-icons/ai'
import type { Product } from '../../../services'

export const ProductThumbnail = ({ product }: { product: Product }) => {
  const imageUrl = product.images?.[0]

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-admin bg-cream ring-1 ring-berry/10">
      {imageUrl ? (
        <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
      ) : (
        <AiOutlineGift className="text-2xl text-muted" />
      )}
    </div>
  )
}
