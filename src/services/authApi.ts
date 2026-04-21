import { api, COMPANY_ID } from '@/lib/api'

export interface ApiCustomer {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  company_id: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}

export interface AuthResponse {
  success: boolean
  token: string
  customer: ApiCustomer
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post('/customer/login', {
      ...payload,
      company_id: Number(COMPANY_ID),
    })
    return res.data
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post('/customer/register', {
      ...payload,
      company_id: Number(COMPANY_ID),
    })
    return res.data
  },

  getProfile: async (): Promise<ApiCustomer> => {
    const res = await api.get('/profile')
    return res.data.data
  },

  updateProfile: async (data: Partial<ApiCustomer & { password?: string }>): Promise<ApiCustomer> => {
    const res = await api.put('/profile', data)
    return res.data.data
  },
}
