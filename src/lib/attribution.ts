/**
 * Ad / social attribution capture (utm_* + click ids + campaign link code + referrer).
 * Captured on every page load into localStorage as first-touch and last-touch (30-day expiry).
 * The last touch is sent with checkout and quick orders. Never throws.
 */

export interface AttributionTouch {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  /** fbclid / gclid / ttclid value */
  clickId?: string
  clickIdType?: 'fbclid' | 'gclid' | 'ttclid'
  /** Campaign link code (`cl` query param or /l/:code) */
  campaignCode?: string
  landingUrl?: string
  referrer?: string
  /** epoch ms when captured */
  capturedAt: number
}

/** Shape sent to the API (`attribution` on POST /orders and POST /quick-order). */
export interface AttributionPayload {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  clickId?: string
  clickIdType?: 'fbclid' | 'gclid' | 'ttclid'
  campaignCode?: string
  landingUrl?: string
  referrer?: string
}

export const ATTRIBUTION_FIRST_KEY = 'aura_attr_first'
export const ATTRIBUTION_LAST_KEY = 'aura_attr_last'
export const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000

const MAX_LEN = 255
const clean = (v: string | null | undefined, max = MAX_LEN): string | undefined => {
  const t = (v ?? '').trim()
  return t ? t.slice(0, max) : undefined
}

/**
 * Parse attribution signals from a URL query string + referrer.
 * Returns null when the visit carries no signal (no utm/click id/code and no external referrer).
 */
export function parseAttribution(
  search: string,
  referrer = '',
  landingUrl = '',
  currentHost = '',
  now = Date.now(),
): AttributionTouch | null {
  let params: URLSearchParams
  try {
    params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  } catch {
    return null
  }

  const touch: AttributionTouch = { capturedAt: now }
  touch.utmSource = clean(params.get('utm_source'))
  touch.utmMedium = clean(params.get('utm_medium'))
  touch.utmCampaign = clean(params.get('utm_campaign'))
  touch.utmContent = clean(params.get('utm_content'))
  touch.utmTerm = clean(params.get('utm_term'))
  touch.campaignCode = clean(params.get('cl'), 32)

  for (const key of ['fbclid', 'gclid', 'ttclid'] as const) {
    const v = clean(params.get(key), 500)
    if (v) {
      touch.clickId = v
      touch.clickIdType = key
      break
    }
  }

  // Referrer only counts when it is an external site (internal navigation is not a touch)
  let externalReferrer: string | undefined
  const ref = clean(referrer, 500)
  if (ref) {
    try {
      const refHost = new URL(ref).host
      if (!currentHost || refHost !== currentHost) externalReferrer = ref
    } catch {
      /* invalid referrer */
    }
  }
  touch.referrer = externalReferrer

  const hasSignal =
    !!(touch.utmSource || touch.utmMedium || touch.utmCampaign || touch.utmContent || touch.utmTerm || touch.clickId || touch.campaignCode || externalReferrer)
  if (!hasSignal) return null

  touch.landingUrl = clean(landingUrl, 1000)
  // drop undefined keys for a compact payload
  for (const k of Object.keys(touch) as (keyof AttributionTouch)[]) {
    if (touch[k] === undefined) delete touch[k]
  }
  return touch
}

const read = (key: string, now = Date.now()): AttributionTouch | null => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AttributionTouch
    if (!parsed || typeof parsed.capturedAt !== 'number') return null
    if (now - parsed.capturedAt > ATTRIBUTION_TTL_MS) {
      localStorage.removeItem(key)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

const write = (key: string, touch: AttributionTouch) => {
  try {
    localStorage.setItem(key, JSON.stringify(touch))
  } catch {
    /* storage full / blocked */
  }
}

/** Store a touch: first-touch only when none (or expired), last-touch always. */
export function recordTouch(touch: AttributionTouch, now = Date.now()): void {
  if (!read(ATTRIBUTION_FIRST_KEY, now)) write(ATTRIBUTION_FIRST_KEY, touch)
  write(ATTRIBUTION_LAST_KEY, touch)
}

/**
 * Capture attribution from the current window location (+ document.referrer on a full page load).
 * SPA route changes pass `includeReferrer: false` — document.referrer does not change on client navigation.
 */
export function captureAttribution({ includeReferrer = true }: { includeReferrer?: boolean } = {}): AttributionTouch | null {
  try {
    if (typeof window === 'undefined') return null
    const touch = parseAttribution(
      window.location.search,
      includeReferrer && typeof document !== 'undefined' ? document.referrer : '',
      window.location.href,
      window.location.host,
    )
    if (!touch) return null
    // Same landing URL already recorded (e.g. /l/:code stored it with the referrer just before navigating) → keep that richer touch
    const last = read(ATTRIBUTION_LAST_KEY)
    if (last?.landingUrl && last.landingUrl === touch.landingUrl && (!touch.referrer || touch.referrer === last.referrer)) return last
    recordTouch(touch)
    return touch
  } catch {
    return null
  }
}

/** Record a campaign link code (from /l/:code) as part of the last touch. */
export function recordCampaignCode(code: string): void {
  try {
    const c = clean(code, 32)
    if (!c) return
    const last = read(ATTRIBUTION_LAST_KEY)
    const touch: AttributionTouch = { ...(last ?? {}), campaignCode: c, capturedAt: Date.now() }
    recordTouch(touch)
  } catch {
    /* ignore */
  }
}

export function getFirstTouch(): AttributionTouch | null {
  return read(ATTRIBUTION_FIRST_KEY)
}

export function getLastTouch(): AttributionTouch | null {
  return read(ATTRIBUTION_LAST_KEY)
}

/** Last touch in the API payload shape, or undefined when there is nothing (so it is omitted from the body). */
export function getAttributionPayload(): AttributionPayload | undefined {
  const t = getLastTouch()
  if (!t) return undefined
  const payload: AttributionPayload = {
    utmSource: t.utmSource,
    utmMedium: t.utmMedium,
    utmCampaign: t.utmCampaign,
    utmContent: t.utmContent,
    utmTerm: t.utmTerm,
    clickId: t.clickId,
    clickIdType: t.clickIdType,
    campaignCode: t.campaignCode,
    landingUrl: t.landingUrl,
    referrer: t.referrer,
  }
  for (const k of Object.keys(payload) as (keyof AttributionPayload)[]) {
    if (payload[k] === undefined) delete payload[k]
  }
  return Object.keys(payload).length ? payload : undefined
}
