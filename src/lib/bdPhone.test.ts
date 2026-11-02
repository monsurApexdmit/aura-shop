import { describe, expect, it } from 'vitest'
import { isValidBdPhone, normalizeBdPhone, toWhatsAppNumber, whatsAppLink } from './bdPhone'

describe('BD phone validation', () => {
  it.each([
    ['01712345678', '01712345678'],
    ['+8801712345678', '01712345678'],
    ['8801812345678', '01812345678'],
    ['008801912345678', '01912345678'],
    ['017-1234 5678', '01712345678'],
    ['+880 1312-345678', '01312345678'],
    ['1612345678', '01612345678'],
  ])('accepts %s', (input, expected) => {
    expect(normalizeBdPhone(input)).toBe(expected)
    expect(isValidBdPhone(input)).toBe(true)
  })

  it.each(['', '0171234567', '017123456789', '01212345678', '01012345678', '02712345678', '+4407712345678', 'abc01712345678'])(
    'rejects %s',
    (input) => {
      expect(normalizeBdPhone(input)).toBeNull()
      expect(isValidBdPhone(input)).toBe(false)
    },
  )

  it('handles null/undefined', () => {
    expect(isValidBdPhone(null)).toBe(false)
    expect(isValidBdPhone(undefined)).toBe(false)
  })

  it('builds wa.me digits', () => {
    expect(toWhatsAppNumber('01712345678')).toBe('8801712345678')
    expect(toWhatsAppNumber('+880 1712-345678')).toBe('8801712345678')
    expect(toWhatsAppNumber('+44 7700 900123')).toBe('447700900123')
    expect(toWhatsAppNumber('12')).toBeNull()
    expect(toWhatsAppNumber('')).toBeNull()
  })
})

describe('whatsAppLink', () => {
  it('builds links from numbers and existing WhatsApp URLs', () => {
    expect(whatsAppLink('01712345678')).toBe('https://wa.me/8801712345678')
    expect(whatsAppLink('https://wa.me/8801712345678', 'Hi there')).toBe('https://wa.me/8801712345678?text=Hi%20there')
    expect(whatsAppLink('wa.me/+8801712345678')).toBe('https://wa.me/8801712345678')
    expect(whatsAppLink('https://api.whatsapp.com/send?phone=8801812345678')).toBe('https://wa.me/8801812345678')
  })

  it('returns null without a usable number', () => {
    expect(whatsAppLink('')).toBeNull()
    expect(whatsAppLink(null)).toBeNull()
    expect(whatsAppLink('https://facebook.com/mystore')).toBeNull()
  })
})
