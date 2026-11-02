/**
 * Bangladesh mobile number helpers. Accepts 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX,
 * with spaces/dashes; operator digit must be 3-9 (013…019).
 */

/** Normalise to the local 11-digit form (01XXXXXXXXX), or null when it is not a valid BD mobile. */
export function normalizeBdPhone(input: string | null | undefined): string | null {
  if (!input) return null
  let digits = input.replace(/[\s\-().]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  if (!/^\d+$/.test(digits)) return null
  if (digits.startsWith('00880')) digits = digits.slice(5)
  else if (digits.startsWith('880')) digits = digits.slice(3)
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null
}

export function isValidBdPhone(input: string | null | undefined): boolean {
  return normalizeBdPhone(input) !== null
}

/** Digits for wa.me links (international form without +), e.g. 8801712345678. Non-BD numbers are passed through as digits. */
export function toWhatsAppNumber(input: string | null | undefined): string | null {
  if (!input) return null
  const bd = normalizeBdPhone(input)
  if (bd) return `88${bd}`
  const digits = input.replace(/\D/g, '')
  return digits.length >= 8 ? digits : null
}

/**
 * wa.me link for a store WhatsApp setting, which may be a number (01…, +880…) or a URL
 * (https://wa.me/8801…, https://api.whatsapp.com/send?phone=…). Returns null when no number can be found.
 */
export function whatsAppLink(numberOrUrl: string | null | undefined, text?: string): string | null {
  const raw = (numberOrUrl ?? '').trim()
  if (!raw) return null
  let candidate = raw
  if (/^https?:\/\//i.test(raw) || /^(wa\.me|api\.whatsapp\.com)\//i.test(raw)) {
    try {
      const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
      candidate = u.searchParams.get('phone') ?? u.pathname.split('/').filter(Boolean).pop() ?? ''
    } catch {
      return null
    }
  }
  const digits = toWhatsAppNumber(candidate)
  if (!digits) return null
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
