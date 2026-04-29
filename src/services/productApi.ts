import { api } from '@/lib/api'

export interface ApiProductVariant {
  id: number
  name: string
  price: number
  sale_price: number | null
  stock: number
  sku: string
  attributes: string | Record<string, string>
}

export interface ApiProduct {
  id: number
  slug: string
  name: string
  description: string | null
  price: number
  sale_price: number | null
  sku: string | null
  stock: number
  image: string | null
  images: string[]
  category_id: number | null
  category_name: string | null
  rating: number
  reviews_count: number
  is_featured: boolean
  is_hot_deal: boolean
  is_best_seller: boolean
  deal_label: string | null
  variants: ApiProductVariant[]
}

export interface ApiProductReview {
  id: number
  product_id: number
  customer_id: number | null
  customer_name: string
  rating: number
  comment: string
  verified_purchase: boolean
  created_at: string
  reply: null | {
    body: string
    author_name: string
    replied_at: string | null
  }
}

export interface ProductReviewSummary {
  average_rating: number
  review_count: number
  distribution: Array<{
    stars: number
    count: number
    percent: number
  }>
}

export interface ProductReviewsResponse {
  summary: ProductReviewSummary
  reviews: ApiProductReview[]
}

export interface ProductFilters {
  search?: string
  category_id?: number | string
  limit?: number
  page?: number
}

export type DealFilter = 'all' | 'hot_deal' | 'best_seller' | 'featured' | 'on_sale'

export interface PaginatedProducts {
  data: ApiProduct[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export const productApi = {
  getAll: async (filters: ProductFilters = {}): Promise<PaginatedProducts> => {
    const res = await api.get('/products', { params: filters })
    return res.data
  },

  getDeals: async (filter: DealFilter = 'all', limit = 48): Promise<PaginatedProducts> => {
    const res = await api.get('/deals', { params: { filter, limit } })
    return res.data
  },

  getBySlug: async (slug: string): Promise<ApiProduct> => {
    const res = await api.get(`/products/${slug}`)
    return res.data.data
  },

  getReviews: async (slug: string, params?: { per_page?: number; page?: number }): Promise<ProductReviewsResponse> => {
    const res = await api.get(`/products/${slug}/reviews`, { params })
    return res.data.data
  },

  submitReview: async (slug: string, payload: { rating: number; comment: string }): Promise<{
    review: ApiProductReview
    summary: ProductReviewSummary
  }> => {
    const res = await api.post(`/products/${slug}/reviews`, payload)
    return res.data.data
  },
}
