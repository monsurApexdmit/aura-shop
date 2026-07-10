import { api } from '@/lib/api'

export interface ApiAddress {
  id: number
  full_name: string
  phone: string | null
  email: string | null
  address_line1: string
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  address_type: string
  is_default: boolean
}

export interface AddressPayload {
  full_name: string
  phone?: string
  email?: string
  address_line1: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  address_type?: string
  is_default?: boolean
}

export const addressApi = {
  list: async (): Promise<ApiAddress[]> => {
    const res = await api.get('/addresses')
    return res.data.data
  },

  create: async (payload: AddressPayload): Promise<ApiAddress> => {
    const res = await api.post('/addresses', payload)
    return res.data.data
  },

  update: async (id: number, payload: Partial<AddressPayload>): Promise<ApiAddress> => {
    const res = await api.put(`/addresses/${id}`, payload)
    return res.data.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/addresses/${id}`)
  },
}
