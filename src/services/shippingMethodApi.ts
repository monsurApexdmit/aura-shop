import { api } from '@/lib/api'

export interface ShippingMethod {
  id: number
  name: string
  description: string | null
  price: number
  estimated_days: string | null
  icon: string | null
  type?: 'delivery' | 'pickup' | string
  requires_address?: boolean
}

export interface PickupPoint {
  id: number
  name: string
  address: string | null
  district: string | null
  phone: string | null
}

export const shippingMethodApi = {
  getActive: async (): Promise<ShippingMethod[]> => {
    const res = await api.get('/shipping-methods')
    return (res.data.data ?? []).map((m: ShippingMethod) => ({ ...m, price: Number(m.price) || 0 }))
  },
  getPickupPoints: async (): Promise<PickupPoint[]> => {
    const res = await api.get('/pickup-points')
    return res.data.data ?? []
  },
}

export interface StoreHoursInfo {
  hours: Record<string, { open: string; close: string; isOpen: boolean }>
  holidays: string[]
  closedToday: boolean
  nextClosure: string | null
  today: string
}

export const storeHoursApi = {
  get: async (): Promise<StoreHoursInfo> => {
    const res = await api.get('/settings/hours')
    const d = res.data.data
    return { ...d, hours: Array.isArray(d.hours) ? {} : d.hours ?? {} }
  },
}
