import axios from 'axios'

const BASE_URL   = import.meta.env.VITE_API_BASE_URL as string
export const COMPANY_ID = import.meta.env.VITE_COMPANY_ID as string
const IMAGE_BASE = BASE_URL.replace('/api', '')

export const api = axios.create({
  baseURL: `${BASE_URL}/store`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (!config.params) config.params = {}
  config.params.company_id = COMPANY_ID

  const token = localStorage.getItem('customer_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '/placeholder.svg'
  if (path.startsWith('http')) return path
  return `${IMAGE_BASE}/storage/${path.replace(/^\//, '')}`
}
