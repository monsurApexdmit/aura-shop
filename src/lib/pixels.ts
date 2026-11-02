/**
 * Optional Facebook (Meta) Pixel + TikTok Pixel. Loaded only when the online-store settings
 * provide ids; every call is a no-op (and never throws) when a pixel is not loaded.
 */

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown }
type Ttq = { load?: (id: string) => void; page?: () => void; track?: (event: string, data?: Record<string, unknown>) => void }

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
    ttq?: Ttq & unknown[]
    TiktokAnalyticsObject?: string
  }
}

const PIXEL_ID_RE = /^[A-Za-z0-9_-]{5,40}$/

let fbLoadedId: string | null = null
let ttLoadedId: string | null = null

function loadFacebookPixel(id: string) {
  if (fbLoadedId === id || !PIXEL_ID_RE.test(id)) return
  if (!window.fbq) {
    const fbq: Fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args)
      else fbq.queue!.push(args)
    } as Fbq
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    window.fbq = fbq
    if (!window._fbq) window._fbq = fbq
    const s = document.createElement('script')
    s.async = true
    s.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(s)
  }
  window.fbq('init', id)
  fbLoadedId = id
}

function loadTikTokPixel(id: string) {
  if (ttLoadedId === id || !PIXEL_ID_RE.test(id)) return
  if (!window.ttq) {
    // Minimal TikTok queue stub; the real SDK replays the queue once loaded.
    const ttq = [] as unknown as Ttq & unknown[] & { methods: string[]; _i?: Record<string, unknown> }
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']
    for (const m of ttq.methods) {
      ;(ttq as unknown as Record<string, unknown>)[m] = (...args: unknown[]) => { ttq.push([m, ...args]) }
    }
    ttq._i = {}
    ttq.load = (pixelId: string) => {
      const s = document.createElement('script')
      s.async = true
      s.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(pixelId)}&lib=ttq`
      document.head.appendChild(s)
    }
    window.TiktokAnalyticsObject = 'ttq'
    window.ttq = ttq
  }
  window.ttq.load?.(id)
  ttLoadedId = id
}

/** Load pixels for whichever ids are configured (call again when settings arrive; idempotent). */
export function initPixels(ids: { facebookPixelId?: string | null; tiktokPixelId?: string | null }) {
  try {
    if (typeof window === 'undefined') return
    const fb = ids.facebookPixelId?.trim()
    const tt = ids.tiktokPixelId?.trim()
    if (fb) loadFacebookPixel(fb)
    if (tt) loadTikTokPixel(tt)
  } catch {
    /* never break the page */
  }
}

export const pixelsActive = () => !!(fbLoadedId || ttLoadedId)

export interface PixelContent {
  id?: string | number
  name?: string
  value?: number
  currency?: string
  quantity?: number
}

const fb = (...args: unknown[]) => { try { if (fbLoadedId) window.fbq?.(...args) } catch { /* ignore */ } }
const tt = (event: string, data?: Record<string, unknown>) => { try { if (ttLoadedId) window.ttq?.track?.(event, data) } catch { /* ignore */ } }

export function trackPageView() {
  fb('track', 'PageView')
  try { if (ttLoadedId) window.ttq?.page?.() } catch { /* ignore */ }
}

export function trackViewContent(c: PixelContent) {
  const currency = c.currency ?? 'BDT'
  fb('track', 'ViewContent', { content_ids: c.id != null ? [String(c.id)] : undefined, content_name: c.name, content_type: 'product', value: c.value, currency })
  tt('ViewContent', { content_id: c.id != null ? String(c.id) : undefined, content_name: c.name, content_type: 'product', value: c.value, currency })
}

export function trackInitiateCheckout(c: { value: number; currency?: string; numItems?: number }) {
  const currency = c.currency ?? 'BDT'
  fb('track', 'InitiateCheckout', { value: c.value, currency, num_items: c.numItems })
  tt('InitiateCheckout', { value: c.value, currency })
}

export function trackPurchase(c: { value: number; currency?: string; orderId?: string; contentIds?: (string | number)[] }) {
  const currency = c.currency ?? 'BDT'
  fb('track', 'Purchase', { value: c.value, currency, content_ids: c.contentIds?.map(String), content_type: 'product', order_id: c.orderId })
  tt('CompletePayment', { value: c.value, currency, content_id: c.contentIds?.[0] != null ? String(c.contentIds[0]) : undefined })
}
