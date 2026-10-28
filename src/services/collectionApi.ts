import { api } from '@/lib/api'
import type { ApiProduct, PaginatedProducts } from '@/services/productApi'

// Curated product groups set up in admin (Online store > Collections).
// Contract: ecommerce-admin/COLLECTIONS_API_CONTRACT.md sections 3.4 and 7.
export interface ApiCollection {
  id: number
  name: string
  slug: string
  description: string | null
  /** Stored path; use imageUrl (absolute) for <img>. */
  image?: string | null
  imageUrl: string | null
  /** Storefront-visible products only. */
  productCount: number
  sortOrder?: number
  showOnHomepage: boolean
  productSort?: CollectionSort
  seoTitle?: string | null
  seoDescription?: string | null
}

export type CollectionSort = 'manual' | 'best_selling' | 'price_asc' | 'price_desc' | 'newest' | 'name'

export interface CollectionProductsParams {
  sort?: CollectionSort
  page?: number
  per_page?: number
}

export interface CollectionDetail {
  collection: ApiCollection
  products: PaginatedProducts
}

export const collectionApi = {
  getAll: async (): Promise<ApiCollection[]> => {
    const res = await api.get('/collections')
    return res.data.data ?? []
  },

  getBySlug: async (slug: string, params: CollectionProductsParams = {}): Promise<CollectionDetail> => {
    const res = await api.get(`/collections/${encodeURIComponent(slug)}`, { params })
    const body = res.data
    const collection: ApiCollection = body.data?.collection ?? body.collection ?? body.data
    const products: ApiProduct[] = body.data?.products ?? body.products ?? []
    const meta = body.meta ?? body.data?.meta ?? {
      current_page: 1, last_page: 1, per_page: products.length, total: products.length,
    }
    return { collection, products: { data: products, meta } }
  },
}
