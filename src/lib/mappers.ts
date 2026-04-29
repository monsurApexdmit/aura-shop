import { getImageUrl } from '@/lib/api'
import type { ApiProduct } from '@/services/productApi'
import type { Product, ProductVariant } from '@/types/product'

export function mapApiProduct(p: ApiProduct): Product {
  const displayPrice    = (p.sale_price && p.sale_price > 0) ? p.sale_price : p.price
  const originalPrice   = (p.sale_price && p.sale_price > 0 && p.sale_price < p.price) ? p.price : undefined
  const primaryImage    = p.image ? getImageUrl(p.image) : (p.images?.[0] ? getImageUrl(p.images[0]) : '/placeholder.jpg')

  const variants: ProductVariant[] = p.variants.map((v) => {
    let attrs: Record<string, string> = {}
    if (typeof v.attributes === 'string') {
      try { attrs = JSON.parse(v.attributes) } catch { attrs = {} }
    } else if (v.attributes && typeof v.attributes === 'object') {
      attrs = v.attributes as Record<string, string>
    }

    return {
      id:         String(v.id),
      name:       v.name,
      attributes: attrs,
      price:      v.price,
      salePrice:  v.sale_price ?? undefined,
      stock:      v.stock,
      sku:        v.sku,
    }
  })

  const badge = p.deal_label
    ?? (p.is_hot_deal ? 'Hot Deal' : p.is_best_seller ? 'Best Seller' : p.is_featured ? 'Featured' : undefined)

  return {
    id:            String(p.id),
    slug:          p.slug,
    name:          p.name,
    price:         displayPrice,
    originalPrice,
    image:         primaryImage,
    images:        p.images?.map(getImageUrl) ?? [primaryImage],
    category:      p.category_name ?? '',
    subcategory:   '',
    badge,
    sku:           p.sku ?? '',
    stock:         p.stock,
    description:   p.description ?? '',
    rating:        p.rating ?? 0,
    reviews:       p.reviews_count ?? 0,
    variants,
  }
}
