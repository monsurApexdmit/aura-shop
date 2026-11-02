import { beforeEach, describe, expect, it } from 'vitest'
import {
  ATTRIBUTION_FIRST_KEY,
  ATTRIBUTION_LAST_KEY,
  ATTRIBUTION_TTL_MS,
  getAttributionPayload,
  getFirstTouch,
  getLastTouch,
  parseAttribution,
  recordCampaignCode,
  captureAttribution,
  recordTouch,
} from './attribution'

describe('parseAttribution', () => {
  it('reads utm params, click id and campaign code', () => {
    const t = parseAttribution(
      '?utm_source=facebook&utm_medium=paid_social&utm_campaign=eid&utm_content=post1&utm_term=panjabi&fbclid=ABC&cl=x7Kp2q',
      '',
      'https://shop.test/product/a?utm_source=facebook',
      'shop.test',
      1000,
    )
    expect(t).toMatchObject({
      utmSource: 'facebook',
      utmMedium: 'paid_social',
      utmCampaign: 'eid',
      utmContent: 'post1',
      utmTerm: 'panjabi',
      clickId: 'ABC',
      clickIdType: 'fbclid',
      campaignCode: 'x7Kp2q',
      landingUrl: 'https://shop.test/product/a?utm_source=facebook',
      capturedAt: 1000,
    })
  })

  it('detects gclid and ttclid', () => {
    expect(parseAttribution('gclid=G1')).toMatchObject({ clickId: 'G1', clickIdType: 'gclid' })
    expect(parseAttribution('?ttclid=T1')).toMatchObject({ clickId: 'T1', clickIdType: 'ttclid' })
  })

  it('returns null without any signal', () => {
    expect(parseAttribution('?page=2', '', 'https://shop.test/shop?page=2', 'shop.test')).toBeNull()
    expect(parseAttribution('')).toBeNull()
  })

  it('counts an external referrer but ignores internal ones', () => {
    const ext = parseAttribution('', 'https://l.facebook.com/l.php?u=x', 'https://shop.test/', 'shop.test')
    expect(ext?.referrer).toBe('https://l.facebook.com/l.php?u=x')
    expect(parseAttribution('', 'https://shop.test/shop', 'https://shop.test/', 'shop.test')).toBeNull()
    expect(parseAttribution('', 'not a url', '', 'shop.test')).toBeNull()
  })

  it('omits undefined keys', () => {
    const t = parseAttribution('?utm_source=ig')!
    expect(Object.keys(t).sort()).toEqual(['capturedAt', 'utmSource'])
  })

  it('trims and caps long values', () => {
    const t = parseAttribution(`?utm_campaign=${'a'.repeat(400)}&utm_source=%20wa%20`)!
    expect(t.utmCampaign).toHaveLength(255)
    expect(t.utmSource).toBe('wa')
  })
})

describe('first/last touch storage', () => {
  beforeEach(() => localStorage.clear())

  it('keeps the first touch and overwrites the last touch', () => {
    recordTouch({ utmSource: 'facebook', capturedAt: Date.now() })
    recordTouch({ utmSource: 'tiktok', capturedAt: Date.now() })
    expect(getFirstTouch()?.utmSource).toBe('facebook')
    expect(getLastTouch()?.utmSource).toBe('tiktok')
  })

  it('expires touches after 30 days', () => {
    const old = Date.now() - ATTRIBUTION_TTL_MS - 1000
    localStorage.setItem(ATTRIBUTION_LAST_KEY, JSON.stringify({ utmSource: 'facebook', capturedAt: old }))
    localStorage.setItem(ATTRIBUTION_FIRST_KEY, JSON.stringify({ utmSource: 'facebook', capturedAt: old }))
    expect(getLastTouch()).toBeNull()
    expect(getFirstTouch()).toBeNull()
    expect(localStorage.getItem(ATTRIBUTION_LAST_KEY)).toBeNull()
  })

  it('ignores corrupt storage', () => {
    localStorage.setItem(ATTRIBUTION_LAST_KEY, '{not json')
    expect(getLastTouch()).toBeNull()
    expect(getAttributionPayload()).toBeUndefined()
  })

  it('builds the API payload from the last touch', () => {
    recordTouch({ utmSource: 'facebook', clickId: 'F', clickIdType: 'fbclid', campaignCode: 'abc', capturedAt: Date.now() })
    expect(getAttributionPayload()).toEqual({ utmSource: 'facebook', clickId: 'F', clickIdType: 'fbclid', campaignCode: 'abc' })
  })

  it('records a campaign link code onto the last touch', () => {
    recordTouch({ utmSource: 'whatsapp', capturedAt: Date.now() })
    recordCampaignCode('Q1w2E3')
    expect(getLastTouch()).toMatchObject({ utmSource: 'whatsapp', campaignCode: 'Q1w2E3' })
  })
})

describe('captureAttribution', () => {
  beforeEach(() => localStorage.clear())

  it('captures from window.location and skips a repeat of the same landing URL', () => {
    window.history.replaceState(null, '', '/order/a?utm_source=facebook&cl=abc')
    recordTouch({ utmSource: 'facebook', campaignCode: 'abc', referrer: 'https://l.facebook.com/', landingUrl: window.location.href, capturedAt: Date.now() })
    captureAttribution({ includeReferrer: false })
    expect(getLastTouch()?.referrer).toBe('https://l.facebook.com/')

    window.history.replaceState(null, '', '/product/b?utm_source=tiktok')
    captureAttribution({ includeReferrer: false })
    expect(getLastTouch()).toMatchObject({ utmSource: 'tiktok' })
    expect(getFirstTouch()?.utmSource).toBe('facebook')
    window.history.replaceState(null, '', '/')
  })
})
