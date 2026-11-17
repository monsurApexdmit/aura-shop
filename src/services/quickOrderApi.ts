import { api, getImageUrl } from '@/lib/api'
import type { AttributionPayload } from '@/lib/attribution'

/* Ad / social order links: GET /store/l/{code}, GET /store/quick-order/{slug}, POST /store/quick-order */

export interface CampaignLinkResolution {
  /** Relative path + query, e.g. /product/eid-panjabi?utm_source=facebook&cl=x7Kp2q */
  targetUrl: string
  linkId: number | null
  code: string
}

export interface QuickOrderVariant {
  id: number
  name: string
  attributes: Record<string, string>
  price: number
  currentPrice: number
  stock: number
}

export interface QuickOrderProduct {
  id: number
  slug: string
  name: string
  images: string[]
  price: number
  currentPrice: number
  stock: number
  shortDescription: string | null
  variants: QuickOrderVariant[]
}

export interface QuickOrderDeliveryOption {
  id: number
  name: string
  price: number
  estimatedTime: string | null
  description: string | null
}

export interface QuickOrderPaymentMethod {
  slug: string
  name: string
  type: 'cod' | 'manual' | string
  account: string | null
  accountName: string | null
  bankName: string | null
  requiresTransactionId: boolean
}

export interface QuickOrderStore {
  name: string
  phone: string
  whatsapp: string
  currency: string | null
}

export interface QuickOrderCod {
  enabled: boolean
  /** COD rejected when subtotal ≥ limit; 0 = no limit */
  limit: number
  fee: number
}

export interface QuickOrderData {
  product: QuickOrderProduct
  deliveryOptions: QuickOrderDeliveryOption[]
  paymentMethods: QuickOrderPaymentMethod[]
  defaultPaymentMethod: string | null
  cod: QuickOrderCod
  store: QuickOrderStore
}

export interface QuickOrderPayload {
  productId: number
  variantId?: number | null
  quantity: number
  name: string
  phone: string
  address: string
  district?: string
  area?: string
  shippingMethodId: number
  paymentMethod: string
  transactionId?: string
  note?: string
  /** Honeypot: humans never fill this (hidden field); the server rejects non-empty values. */
  website?: string
  /** One key per order attempt: a repeat with the same key returns the first order. */
  idempotencyKey?: string
  attribution?: AttributionPayload
}

export interface QuickOrderResult {
  orderId: number | null
  invoiceNo: string
  subtotal: number
  discount: number
  deliveryCharge: number
  codFee: number
  total: number
  paymentMethod: string
  paymentStatus: string
  status: string
  trackingUrl: string | null
  /** Set when a redirect gateway was chosen (legacy gateway methods) */
  paymentUrl: string | null
}

type Raw = Record<string, unknown>
const obj = (v: unknown): Raw => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : {})
const pick = (o: Raw, ...keys: string[]): unknown => {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k]
  return undefined
}
const num = (v: unknown, fallback = 0): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v))
const strOrNull = (v: unknown): string | null => {
  const s = str(v).trim()
  return s ? s : null
}

const parseAttributes = (v: unknown): Record<string, string> => {
  let a: unknown = v
  if (typeof a === 'string') {
    try { a = JSON.parse(a) } catch { return {} }
  }
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(obj(a))) if (val != null) out[k] = String(val)
  return out
}

/** Product `currentPrice` falls back to an offer/sale price computed like the product page when the API doesn't send it. */
const effectivePrice = (o: Raw, fallbackOffer?: { price: number; type: string }) => {
  const base = num(pick(o, 'price'))
  const sale = num(pick(o, 'salePrice', 'sale_price'))
  const vBase = sale > 0 ? sale : base
  const explicit = pick(o, 'currentPrice', 'current_price', 'finalPrice', 'final_price')
  if (explicit !== undefined) {
    const current = num(explicit)
    return { price: vBase > 0 ? vBase : current, current }
  }
  const offer = num(pick(o, 'offerPrice', 'offer_price')) || fallbackOffer?.price || 0
  const type = str(pick(o, 'offerType', 'offer_type')) || fallbackOffer?.type || 'percentage'
  if (offer > 0) {
    const final = type === 'percentage' ? vBase * (1 - offer / 100) : vBase - offer
    if (final > 0 && final < vBase) return { price: vBase, current: Math.round(final * 100) / 100 }
  }
  return { price: vBase, current: vBase }
}

export const normalizeQuickOrderData = (payload: unknown): QuickOrderData => {
  const root = obj(payload)
  const p = obj(pick(root, 'product'))
  const productOffer = { price: num(pick(p, 'offerPrice', 'offer_price')), type: str(pick(p, 'offerType', 'offer_type')) || 'percentage' }
  const pp = effectivePrice(p)

  const rawImages = pick(p, 'images')
  const images = (Array.isArray(rawImages) ? rawImages : [])
    .map((i) => (typeof i === 'string' ? i : str(pick(obj(i), 'url', 'path', 'image'))))
    .filter(Boolean)
  const mainImage = str(pick(p, 'image', 'imageUrl', 'image_url'))
  if (mainImage && !images.includes(mainImage)) images.unshift(mainImage)

  const rawVariants = pick(p, 'variants')
  const variants: QuickOrderVariant[] = (Array.isArray(rawVariants) ? rawVariants : []).map((rv) => {
    const v = obj(rv)
    const vp = effectivePrice(v, productOffer)
    const attributes = parseAttributes(pick(v, 'attributes'))
    return {
      id: num(pick(v, 'id')),
      name: str(pick(v, 'name')) || Object.values(attributes).join(' / ') || `Option ${num(pick(v, 'id'))}`,
      attributes,
      price: vp.price,
      currentPrice: vp.current,
      stock: num(pick(v, 'stock', 'availableStock', 'available_stock')),
    }
  })

  const rawDelivery = pick(root, 'deliveryOptions', 'delivery_options', 'shippingMethods', 'shipping_methods')
  const deliveryOptions: QuickOrderDeliveryOption[] = (Array.isArray(rawDelivery) ? rawDelivery : []).map((rd) => {
    const d = obj(rd)
    return {
      id: num(pick(d, 'id')),
      name: str(pick(d, 'name')),
      price: num(pick(d, 'price', 'charge', 'cost')),
      estimatedTime: strOrNull(pick(d, 'estimatedTime', 'estimated_time', 'estimatedDays', 'estimated_days')),
      description: strOrNull(pick(d, 'description')),
    }
  })

  const rawPay = pick(root, 'paymentMethods', 'payment_methods')
  const paymentMethods: QuickOrderPaymentMethod[] = (Array.isArray(rawPay) ? rawPay : [])
    .map((rm) => {
      const m = obj(rm)
      const slug = str(pick(m, 'slug', 'id', 'code'))
      const type = str(pick(m, 'type', 'gatewayType', 'gateway_type')) || (slug === 'cod' ? 'cod' : 'manual')
      const isCod = type === 'cod' || slug === 'cod'
      const req = pick(m, 'requiresTransactionId', 'requires_transaction_id')
      // Transaction ID only for send-money methods (bKash/Nagad); redirect gateways (sslcommerz…) never need one
      return {
        slug,
        name: str(pick(m, 'name', 'label')) || slug,
        type: isCod ? 'cod' : type,
        account: strOrNull(pick(m, 'account', 'accountNumber', 'account_number')),
        accountName: strOrNull(pick(m, 'accountName', 'account_name')),
        bankName: strOrNull(pick(m, 'bankName', 'bank_name')),
        requiresTransactionId: req !== undefined ? !!req : ['bkash', 'nagad'].includes(slug),
      }
    })
    .filter((m) => m.slug)

  const s = obj(pick(root, 'store'))
  const cod = obj(pick(root, 'cod'))
  return {
    product: {
      id: num(pick(p, 'id')),
      slug: str(pick(p, 'slug')),
      name: str(pick(p, 'name')),
      images: images.map((i) => getImageUrl(i)),
      price: pp.price,
      currentPrice: pp.current,
      stock: num(pick(p, 'stock', 'availableStock', 'available_stock')),
      shortDescription: strOrNull(pick(p, 'shortDescription', 'short_description', 'description')),
      variants,
    },
    deliveryOptions,
    paymentMethods,
    defaultPaymentMethod: strOrNull(pick(root, 'defaultPaymentMethod', 'default_payment_method')),
    cod: {
      enabled: pick(cod, 'enabled') !== undefined ? !!pick(cod, 'enabled') : paymentMethods.some((m) => m.type === 'cod'),
      limit: num(pick(cod, 'limit')),
      fee: num(pick(cod, 'fee')),
    },
    store: {
      name: str(pick(s, 'name', 'storeName')),
      phone: str(pick(s, 'phone', 'storePhone')),
      whatsapp: str(pick(s, 'whatsapp', 'whatsappNumber', 'whatsapp_number')),
      currency: strOrNull(pick(s, 'currency')),
    },
  }
}

const unwrap = (data: unknown): unknown => {
  const o = obj(data)
  return o.data !== undefined ? o.data : data
}

export const quickOrderApi = {
  /** Resolves a short link and records the click; `ref` = landing page document.referrer. */
  resolveLink: async (code: string, ref?: string): Promise<CampaignLinkResolution> => {
    const res = await api.get(`/l/${encodeURIComponent(code)}`, { params: ref ? { ref } : undefined })
    const d = obj(unwrap(res.data))
    return {
      targetUrl: str(pick(d, 'targetUrl', 'target_url', 'url')) || '/',
      linkId: pick(d, 'linkId', 'link_id', 'id') != null ? num(pick(d, 'linkId', 'link_id', 'id')) : null,
      code: str(pick(d, 'code')) || code,
    }
  },

  get: async (slugOrId: string): Promise<QuickOrderData> => {
    const res = await api.get(`/quick-order/${encodeURIComponent(slugOrId)}`)
    return normalizeQuickOrderData(unwrap(res.data))
  },

  place: async (payload: QuickOrderPayload): Promise<QuickOrderResult> => {
    const res = await api.post('/quick-order', payload)
    const d = obj(unwrap(res.data))
    const orderId = pick(d, 'orderId', 'order_id', 'id')
    return {
      orderId: orderId != null ? num(orderId) : null,
      invoiceNo: str(pick(d, 'invoiceNo', 'invoice_no')),
      subtotal: num(pick(d, 'subtotal')),
      discount: num(pick(d, 'discount')),
      deliveryCharge: num(pick(d, 'deliveryCharge', 'delivery_charge', 'shippingCost', 'shipping_cost')),
      codFee: num(pick(d, 'codFee', 'cod_fee')),
      total: num(pick(d, 'total', 'amount')),
      paymentMethod: str(pick(d, 'paymentMethod', 'payment_method')),
      paymentStatus: str(pick(d, 'paymentStatus', 'payment_status')),
      status: str(pick(d, 'status')),
      trackingUrl: strOrNull(pick(d, 'trackingUrl', 'tracking_url')),
      paymentUrl: strOrNull(pick(d, 'paymentUrl', 'payment_url')),
    }
  },
}

/** Keep only a safe in-app relative path from a link target (never navigate off-site). */
export function safeRelativeTarget(target: string | null | undefined): string {
  const t = (target ?? '').trim()
  if (!t) return '/'
  try {
    // Absolute URL: keep path + query + hash only
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) {
      const u = new URL(t)
      return `${u.pathname}${u.search}${u.hash}` || '/'
    }
  } catch {
    return '/'
  }
  if (t.startsWith('//')) return '/'
  return t.startsWith('/') ? t : `/${t}`
}
