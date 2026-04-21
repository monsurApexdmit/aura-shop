// Unified product type used across the app (mapped from API response)
export interface ProductVariant {
  id: string
  name: string
  attributes: Record<string, string>
  price: number
  salePrice?: number
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
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  subcategory: string
  badge?: string
  rating: number
  reviews: number
  sku?: string
  stock?: number
  attributes?: ProductAttribute[]
  variants?: ProductVariant[]
  description?: string
}
