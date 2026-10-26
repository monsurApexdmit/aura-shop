import { api } from '@/lib/api'

export type PaymentGatewayType = 'cod' | 'manual' | 'sslcommerz' | 'portwallet' | 'stripe' | 'paypal' | 'bkash' | 'nagad'

export interface PaymentMethod {
  id: number | string
  slug?: string
  account?: string | null
  account_name?: string | null
  bank_name?: string | null
  name: string
  description: string | null
  icon: string | null
  gateway_type: PaymentGatewayType
  cod_deposit_required?: boolean
  cod_deposit_amount?: number | null
}

export const paymentMethodApi = {
  getActive: async (): Promise<PaymentMethod[]> => {
    const res = await api.get('/payment-methods')
    return res.data.data ?? []
  },
  /** Methods plus the admin-chosen default slug (null when not configured). */
  getOnline: async (): Promise<{ methods: PaymentMethod[]; default: string | null }> => {
    const res = await api.get('/payment-methods')
    return { methods: res.data.data ?? [], default: res.data.default ?? null }
  },
}
