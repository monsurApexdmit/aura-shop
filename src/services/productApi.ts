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
  variants: ApiProductVariant[]
}

export interface ProductFilters {
  search?: string
  category_id?: number | string
  limit?: number
  page?: number
}

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

  getById: async (id: number): Promise<ApiProduct> => {
    const res = await api.get(`/products/${id}`)
    return res.data.data
  },
}
