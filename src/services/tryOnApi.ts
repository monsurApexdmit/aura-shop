import { api } from '@/lib/api'

export interface TryOnResult {
  image: string // data URI of the composited image
  provider: string
  note?: string
}

export const tryOnApi = {
  /**
   * Sends the user's photo + the garment image URL to the backend try-on
   * endpoint and returns a composited preview. Nothing is stored.
   */
  generate: (photo: File, garmentUrl: string, category?: string): Promise<TryOnResult> => {
    const form = new FormData()
    form.append('photo', photo)
    form.append('garmentUrl', garmentUrl)
    if (category) form.append('category', category)
    return api
      .post('/try-on', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data.data)
  },
}
