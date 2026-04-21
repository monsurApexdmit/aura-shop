import { api } from '@/lib/api'

export interface ApiSubCategory {
  id: number
  name: string
  slug: string
}

export interface ApiCategory {
  id: number
  name: string
  slug: string
  children: ApiSubCategory[]
}

export const categoryApi = {
  getAll: async (): Promise<ApiCategory[]> => {
    const res = await api.get('/categories')
    return res.data.data
  },
}
