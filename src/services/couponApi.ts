import { api } from '@/lib/api'

export interface CouponResult {
  code: string
  campaign_name: string
  type: 'fixed' | 'percentage'
  discount: number
  min_order_amount: number | null
  free_shipping: boolean
}

export const couponApi = {
  validate: async (code: string): Promise<CouponResult> => {
    const res = await api.get('/coupons/validate', { params: { code } })
    return res.data.data
  },

  getActive: async (): Promise<CouponResult[]> => {
    const res = await api.get('/coupons/active')
    return res.data.data
  },
}
