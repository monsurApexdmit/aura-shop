import { api } from '@/lib/api'

export interface WishlistProduct {
  id: number
  name: string
  slug: string
  price: number
  sale_price: number | null
  stock: number
  image: string | null
  images: string[]
  category_id: number | null
  category_name: string | null
  variants: { id: number; name: string; price: number; sale_price: number | null; stock: number }[]
}

export interface WishlistItem {
  wishlist_id: number
  product_id: number
  added_at: string
  product: WishlistProduct
}

export const wishlistApi = {
  getAll: async (): Promise<{ data: WishlistItem[]; total: number }> => {
    const res = await api.get('/wishlist')
    return res.data
  },

  getIds: async (): Promise<number[]> => {
    const res = await api.get('/wishlist/ids')
    return res.data.data ?? []
  },

  add: async (productId: number): Promise<{ wishlist_id: number; product_id: number }> => {
    const res = await api.post('/wishlist', { product_id: productId })
    return res.data
  },

  remove: async (productId: number): Promise<void> => {
    await api.delete(`/wishlist/${productId}`)
  },

  clear: async (): Promise<void> => {
    await api.delete('/wishlist')
  },

  check: async (productId: number): Promise<boolean> => {
    const res = await api.get(`/wishlist/check/${productId}`)
    return res.data.in_wishlist ?? false
  },
}
