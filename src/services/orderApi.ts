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
  shipping_method?: string
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

export interface TrackingEvent {
  status: string
  location: string | null
  description: string | null
  event_time: string
}

export interface ApiShipment {
  tracking_number: string | null
  carrier: string | null
  shipping_method: string | null
  status: string
  shipped_at: string | null
  estimated_delivery: string | null
  delivered_at: string | null
  tracking_history: TrackingEvent[]
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
  shipment?: ApiShipment | null
}

const normalizeOrderItem = (item: Partial<ApiOrderItem> | null | undefined): ApiOrderItem => ({
  id: Number(item?.id ?? 0),
  product_id: Number(item?.product_id ?? 0),
  product_name: item?.product_name ?? 'Product',
  variant_name: item?.variant_name ?? null,
  quantity: Number(item?.quantity ?? 0),
  unit_price: Number(item?.unit_price ?? 0),
  total_price: Number(item?.total_price ?? 0),
})

const normalizeTrackingEvent = (event: Partial<TrackingEvent> | null | undefined): TrackingEvent => ({
  status: event?.status ?? '',
  location: event?.location ?? null,
  description: event?.description ?? null,
  event_time: event?.event_time ?? '',
})

const normalizeShipment = (shipment: Partial<ApiShipment> | null | undefined): ApiShipment | null => {
  if (!shipment) return null

  return {
    tracking_number: shipment.tracking_number ?? null,
    carrier: shipment.carrier ?? null,
    shipping_method: shipment.shipping_method ?? null,
    status: shipment.status ?? '',
    shipped_at: shipment.shipped_at ?? null,
    estimated_delivery: shipment.estimated_delivery ?? null,
    delivered_at: shipment.delivered_at ?? null,
    tracking_history: Array.isArray(shipment.tracking_history)
      ? shipment.tracking_history.map((event) => normalizeTrackingEvent(event))
      : [],
  }
}

const normalizeOrder = (order: Partial<ApiOrder> | null | undefined): ApiOrder => ({
  id: Number(order?.id ?? 0),
  invoice_no: order?.invoice_no ?? `ORD-${Number(order?.id ?? 0) || 'UNKNOWN'}`,
  order_time: order?.order_time ?? '',
  amount: Number(order?.amount ?? 0),
  shipping_cost: Number(order?.shipping_cost ?? 0),
  discount: Number(order?.discount ?? 0),
  status: order?.status ?? '',
  payment_status: order?.payment_status ?? '',
  fulfillment_status: order?.fulfillment_status ?? '',
  tracking_number: order?.tracking_number ?? null,
  carrier: order?.carrier ?? null,
  method: order?.method ?? 'Standard',
  shipping_address: {
    name: order?.shipping_address?.name ?? '',
    phone: order?.shipping_address?.phone ?? null,
    address: order?.shipping_address?.address ?? null,
    city: order?.shipping_address?.city ?? null,
    state: order?.shipping_address?.state ?? null,
    zip: order?.shipping_address?.zip ?? null,
    country: order?.shipping_address?.country ?? null,
  },
  items: Array.isArray(order?.items) ? order.items.map((item) => normalizeOrderItem(item)) : [],
  shipment: normalizeShipment(order?.shipment),
})

const normalizeOrderList = (payload: unknown): ApiOrder[] => {
  if (!Array.isArray(payload)) return []
  return payload.map((order) => normalizeOrder(order as Partial<ApiOrder>))
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
    return {
      data: normalizeOrderList(res.data?.data),
      meta: {
        current_page: Number(res.data?.meta?.current_page ?? 1),
        last_page: Number(res.data?.meta?.last_page ?? 1),
        total: Number(res.data?.meta?.total ?? 0),
      },
    }
  },

  getById: async (id: number): Promise<ApiOrder> => {
    const res = await api.get(`/orders/${id}`)
    return normalizeOrder(res.data?.data)
  },

  place: async (payload: PlaceOrderPayload): Promise<{ order: ApiOrder; payment_url?: string }> => {
    const res = await api.post('/orders', payload)
    return {
      order: normalizeOrder(res.data?.data),
      payment_url: res.data?.payment_url ?? undefined,
    }
  },

  trackByInvoice: async (invoice: string): Promise<ApiOrder> => {
    const res = await api.get('/orders/track', { params: { invoice } })
    return normalizeOrder(res.data?.data)
  },
}
