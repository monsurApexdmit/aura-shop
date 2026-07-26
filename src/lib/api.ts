import axios from 'axios'

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL as string
const isBrowser = typeof window !== 'undefined'
const rawApiOrigin = RAW_BASE_URL.replace(/\/api\/?$/, '')
const shouldUseDevProxy =
  import.meta.env.DEV &&
  isBrowser &&
  rawApiOrigin &&
  rawApiOrigin !== window.location.origin

export const API_BASE_URL = shouldUseDevProxy ? '/api' : RAW_BASE_URL
// COMPANY_ID kept for backwards-compat imports; subdomain-mode ignores it
export const COMPANY_ID = import.meta.env.VITE_COMPANY_ID as string | undefined
const IMAGE_BASE = shouldUseDevProxy ? '' : rawApiOrigin

// Subdomain mode: backend resolves company from Host header — no company_id param needed.
// Fallback: if VITE_COMPANY_ID set, send as query param (legacy local .env mode).
export const USE_SUBDOMAIN = !import.meta.env.VITE_COMPANY_ID

export const api = axios.create({
  baseURL: `${API_BASE_URL}/store`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (!config.params) config.params = {}

  if (!USE_SUBDOMAIN && COMPANY_ID) {
    config.params.company_id = COMPANY_ID
  }

  const token = localStorage.getItem('customer_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('customer_token')) {
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
  const clean = path.replace(/^\//, '')
  if (clean.startsWith('storage/')) return `${IMAGE_BASE}/${clean}`
  return `${IMAGE_BASE}/storage/${clean}`
}
