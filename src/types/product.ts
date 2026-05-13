// Unified product type used across the app (mapped from API response)
export interface ProductVariant {
  id: string
  name: string
  attributes: Record<string, string>
  price: number
  salePrice?: number
  offerPrice?: number
  offerType?: string
  stock: number
  sku: string
}

export interface ProductAttribute {
  name: string
  displayName: string
  values: string[]
}

export interface Product {
  id: string
  slug: string
  name: string
  price: number
  originalPrice?: number
  offerPrice?: number
  offerType?: string
  image: string
  images?: string[]
  category: string
  subcategory: string
  badge?: string
  rating: number
  reviews: number
  sku?: string
  stock?: number
  totalSold?: number
  attributes?: ProductAttribute[]
  variants?: ProductVariant[]
  description?: string
}

export interface ProductReviewReply {
  body: string
  authorName: string
  repliedAt: string | null
}

export interface ProductReview {
  id: string
  productId: string
  customerId: number | null
  customerName: string
  rating: number
  comment: string
  verifiedPurchase: boolean
  createdAt: string
  reply?: ProductReviewReply | null
}
