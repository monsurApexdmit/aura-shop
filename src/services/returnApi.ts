import { api } from '@/lib/api'

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export interface ReturnItem {
  id?: number
  product_id: number
  product_name?: string
  variant_id?: number | null
  variant_name?: string | null
  quantity: number
  price?: number
  reason: string
}

export interface CustomerReturn {
  id: number
  return_number?: string
  customer_id: number
  sell_id?: number | null
  order_number?: string | null
  status: ReturnStatus
  refund_method?: string | null
  total_amount?: number
  notes?: string | null
  processed_by?: string | null
  processed_at?: string | null
  rejection_reason?: string | null
  items?: ReturnItem[]
  created_at: string
  updated_at: string
}

export interface CreateReturnPayload {
  sell_id?: number
  order_number?: string
  refund_method?: string
  notes?: string
  items: {
    product_id: number
    variant_id?: number | null
    quantity: number
    reason: string
    price?: number
  }[]
}

const normalizeItem = (i: any): ReturnItem => ({
  id: i?.id,
  product_id: Number(i?.product_id ?? i?.productId ?? 0),
  product_name: i?.product_name ?? i?.productName,
  variant_id: i?.variant_id ?? i?.variantId ?? null,
  variant_name: i?.variant_name ?? i?.variantName ?? null,
  quantity: Number(i?.quantity ?? 1),
  price: i?.price != null ? Number(i.price) : undefined,
  reason: i?.reason ?? '',
})

const normalizeReturn = (d: any): CustomerReturn => ({
  id: Number(d?.id ?? 0),
  return_number: d?.return_number ?? d?.returnNumber,
  customer_id: Number(d?.customer_id ?? d?.customerId ?? 0),
  sell_id: d?.sell_id ?? d?.sellId ?? null,
  order_number: d?.order_number ?? d?.orderNumber ?? null,
  status: d?.status ?? 'pending',
  refund_method: d?.refund_method ?? d?.refundMethod ?? null,
  total_amount: d?.total_amount ?? d?.totalAmount != null ? Number(d?.total_amount ?? d?.totalAmount) : undefined,
  notes: d?.notes ?? null,
  processed_by: d?.processed_by ?? d?.processedBy ?? null,
  processed_at: d?.processed_at ?? d?.processedAt ?? null,
  rejection_reason: d?.rejection_reason ?? d?.rejectionReason ?? null,
  items: Array.isArray(d?.items) ? d.items.map(normalizeItem) : [],
  created_at: d?.created_at ?? d?.createdAt ?? '',
  updated_at: d?.updated_at ?? d?.updatedAt ?? '',
})

export const STATUS_LABEL: Record<ReturnStatus, string> = {
  pending:   'Pending Review',
  approved:  'Approved',
  rejected:  'Rejected',
  completed: 'Completed',
}

export const STATUS_COLOR: Record<ReturnStatus, string> = {
  pending:   'bg-yellow-500/10 text-yellow-600',
  approved:  'bg-green-500/10 text-green-600',
  rejected:  'bg-red-500/10 text-red-600',
  completed: 'bg-blue-500/10 text-blue-600',
}

export const RETURN_REASONS = [
  'Defective / Damaged',
  'Wrong item received',
  'Item not as described',
  'Size / fit issue',
  'Changed my mind',
  'Other',
]

export const returnApi = {
  getAll: async (): Promise<CustomerReturn[]> => {
    const res = await api.get('/returns')
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data ?? []
    return Array.isArray(raw) ? raw.map(normalizeReturn) : []
  },

  getById: async (id: number): Promise<CustomerReturn> => {
    const res = await api.get(`/returns/${id}`)
    return normalizeReturn(res.data?.data ?? res.data)
  },

  create: async (payload: CreateReturnPayload): Promise<CustomerReturn> => {
    const res = await api.post('/returns', payload)
    return normalizeReturn(res.data?.data ?? res.data)
  },

  cancel: async (id: number): Promise<void> => {
    await api.delete(`/returns/${id}`)
  },
}
