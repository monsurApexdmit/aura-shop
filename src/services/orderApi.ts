import { api } from '@/lib/api'

export interface OrderItem {
  product_id: number
  quantity: number
  variant_id?: number | null
}

export interface ShippingAddress {
  name: string
  address: string
  city?: string
  state?: string
  zip?: string
  country?: string
  phone?: string
  email?: string
}

export interface PlaceOrderPayload {
  items: OrderItem[]
  shipping_address: ShippingAddress
  payment_method: string
  coupon_code?: string
  discount?: number
  shipping_cost?: number
}

export interface ApiOrderItem {
  id: number
  product_id: number
  product_name: string
  variant_name: string | null
  quantity: number
  unit_price: number
  total_price: number
}

export interface ApiOrder {
  id: number
  invoice_no: string
  order_time: string
  amount: number
  shipping_cost: number
  discount: number
  status: string
  payment_status: string
  fulfillment_status: string
  tracking_number: string | null
  carrier: string | null
  method: string
  shipping_address: {
    name: string
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    zip: string | null
    country: string | null
  }
  items: ApiOrderItem[]
}

export const mapFulfillmentStatus = (status: string): { label: string; color: string } =>
  ({
    unfulfilled: { label: 'Processing', color: 'yellow' },
    processing:  { label: 'Processing', color: 'yellow' },
    shipped:     { label: 'Shipped',    color: 'blue'   },
    delivered:   { label: 'Delivered',  color: 'green'  },
    cancelled:   { label: 'Cancelled',  color: 'red'    },
  })[status] ?? { label: status, color: 'gray' }

export const orderApi = {
  getAll: async (): Promise<{ data: ApiOrder[]; meta: { current_page: number; last_page: number; total: number } }> => {
    const res = await api.get('/orders')
    return res.data
  },

  getById: async (id: number): Promise<ApiOrder> => {
    const res = await api.get(`/orders/${id}`)
    return res.data.data
  },

  place: async (payload: PlaceOrderPayload): Promise<ApiOrder> => {
    const res = await api.post('/orders', payload)
    return res.data.data
  },
}
