import { describe, expect, it } from 'vitest'
import { normalizeQuickOrderData, safeRelativeTarget } from './quickOrderApi'

describe('normalizeQuickOrderData', () => {
  it('maps the contract payload', () => {
    const d = normalizeQuickOrderData({
      product: {
        id: 345, slug: 'blue-panjabi', name: 'Blue Panjabi', shortDescription: 'Cotton',
        image: 'https://cdn.test/a.jpg', images: ['https://cdn.test/a.jpg', 'https://cdn.test/b.jpg'],
        price: 1800, currentPrice: 1450, stock: 23,
        variants: [{ id: 77, name: 'M / Blue', attributes: { Size: 'M' }, price: 1800, currentPrice: 1450, stock: 5 }],
      },
      deliveryOptions: [{ id: 3, name: 'Inside Dhaka', description: null, price: 60, estimatedDays: '1-2 days' }],
      paymentMethods: [
        { slug: 'cod', name: 'Cash on delivery', type: 'cod', account: null, requiresTransactionId: false },
        { slug: 'bkash', name: 'bKash', type: 'manual', account: '017XXXXXXXX', accountName: 'Shop', requiresTransactionId: true },
      ],
      defaultPaymentMethod: 'cod',
      cod: { enabled: true, limit: 5000, fee: 0 },
      store: { name: 'Demo Shop', phone: '+8801700000000', whatsapp: '8801700000000', currency: 'BDT' },
    })
    expect(d.product).toMatchObject({ id: 345, name: 'Blue Panjabi', price: 1800, currentPrice: 1450, stock: 23 })
    expect(d.product.images).toEqual(['https://cdn.test/a.jpg', 'https://cdn.test/b.jpg'])
    expect(d.product.variants[0]).toMatchObject({ id: 77, name: 'M / Blue', currentPrice: 1450, stock: 5, attributes: { Size: 'M' } })
    expect(d.deliveryOptions[0]).toEqual({ id: 3, name: 'Inside Dhaka', price: 60, estimatedTime: '1-2 days', description: null })
    expect(d.paymentMethods.map((m) => [m.slug, m.type, m.requiresTransactionId])).toEqual([['cod', 'cod', false], ['bkash', 'manual', true]])
    expect(d.cod).toEqual({ enabled: true, limit: 5000, fee: 0 })
    expect(d.store).toMatchObject({ whatsapp: '8801700000000', currency: 'BDT' })
  })

  it('tolerates a sparse payload', () => {
    const d = normalizeQuickOrderData({ product: { id: 1, name: 'X', price: 100, offer_price: 10, offer_type: 'percentage' } })
    expect(d.product.currentPrice).toBe(90)
    expect(d.deliveryOptions).toEqual([])
    expect(d.paymentMethods).toEqual([])
  })
})

describe('safeRelativeTarget', () => {
  it('keeps in-app paths and strips foreign origins', () => {
    expect(safeRelativeTarget('/order/a?utm_source=fb&cl=x')).toBe('/order/a?utm_source=fb&cl=x')
    expect(safeRelativeTarget('https://evil.test/product/a?x=1')).toBe('/product/a?x=1')
    expect(safeRelativeTarget('//evil.test/a')).toBe('/')
    expect(safeRelativeTarget('')).toBe('/')
    expect(safeRelativeTarget('product/a')).toBe('/product/a')
  })
})
