import { getImageUrl } from '@/lib/api'
import type { ApiProduct } from '@/services/productApi'
import type { Product, ProductVariant } from '@/types/product'

export function mapApiProduct(p: ApiProduct): Product {
  const basePrice = (p.sale_price && p.sale_price > 0) ? p.sale_price : p.price
  const offerFinal = p.offer_price && p.offer_price > 0
    ? (p.offer_type === 'percentage'
        ? basePrice * (1 - p.offer_price / 100)
        : basePrice - p.offer_price)
    : null
  const hasValidOffer = offerFinal !== null && offerFinal > 0 && offerFinal < basePrice
  const displayPrice  = hasValidOffer ? offerFinal! : basePrice
  const originalPrice = hasValidOffer ? basePrice
                      : (p.sale_price && p.sale_price > 0 && p.sale_price < p.price) ? p.price
                      : undefined
  const primaryImage    = p.image ? getImageUrl(p.image) : (p.images?.[0] ? getImageUrl(p.images[0]) : '/placeholder.jpg')

  const variants: ProductVariant[] = p.variants.map((v) => {
    let attrs: Record<string, string> = {}
    if (typeof v.attributes === 'string') {
      try { attrs = JSON.parse(v.attributes) } catch { attrs = {} }
    } else if (v.attributes && typeof v.attributes === 'object') {
      attrs = v.attributes as Record<string, string>
    }

    const vBase = (v.sale_price && v.sale_price > 0) ? v.sale_price : v.price
    const vOfferFinal = v.offer_price && v.offer_price > 0
      ? (v.offer_type === 'percentage'
          ? vBase * (1 - v.offer_price / 100)
          : vBase - v.offer_price)
      : null
    const vDisplay = vOfferFinal !== null && vOfferFinal > 0 && vOfferFinal < vBase ? vOfferFinal : vBase

    return {
      id:         String(v.id),
      name:       v.name,
      attributes: attrs,
      price:      vDisplay,
      salePrice:  vBase !== v.price ? vBase : undefined,
      offerPrice: v.offer_price ?? undefined,
      offerType:  v.offer_type ?? undefined,
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
    offerPrice:    p.offer_price ?? undefined,
    offerType:     p.offer_type ?? undefined,
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
