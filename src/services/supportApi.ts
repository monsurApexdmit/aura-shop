import { api } from '@/lib/api'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketCategory = 'order' | 'product' | 'payment' | 'shipping' | 'general'

export interface SupportMessage {
  id: number
  ticketId: number
  customerId: number | null
  body: string | null
  senderType: 'customer' | 'staff'
  senderName: string | null
  createdAt: string
  attachments: SupportAttachment[]
}

export interface SupportAttachment {
  id: number
  name: string
  url: string
  mimeType: string
  sizeBytes: number
  type: 'image' | 'file' | 'voice'
  isImage: boolean
  isAudio: boolean
}

export interface SupportTicket {
  id: number
  ticketNumber: string
  subject: string
  status: TicketStatus
  priority: 'low' | 'medium' | 'high'
  category: TicketCategory
  resolvedAt: string | null
  createdAt: string
  messages: SupportMessage[]
}

export interface ContactTicketPayload {
  name: string
  email: string
  subject: string
  message?: string
  category?: TicketCategory
  priority?: 'low' | 'medium' | 'high'
  attachments?: File[]
}

export interface ContactSubmissionResponse {
  ticket: SupportTicket
  guestAccessToken: string
}

export interface SupportMessagePayload {
  body?: string
  attachments?: File[]
}

function buildSupportFormData(data: Record<string, string | File[] | undefined>) {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      formData.append(key, value)
      return
    }

    if (Array.isArray(value)) {
      value.forEach((file) => formData.append('attachments[]', file))
    }
  })

  return formData
}

export const supportApi = {
  getAll: async (params?: { status?: string; per_page?: number }): Promise<{
    data: SupportTicket[]
    meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  }> => {
    const res = await api.get('/support/tickets', { params })
    return res.data
  },

  get: async (id: number): Promise<SupportTicket> => {
    const res = await api.get(`/support/tickets/${id}`)
    return res.data.data
  },

  create: async (data: {
    subject: string
    message?: string
    category: TicketCategory
    attachments?: File[]
  }): Promise<SupportTicket> => {
    const res = await api.post('/support/tickets', buildSupportFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  reply: async (id: number, payload: string | SupportMessagePayload): Promise<SupportTicket> => {
    const normalized = typeof payload === 'string' ? { body: payload } : payload
    const res = await api.post(`/support/tickets/${id}/reply`, buildSupportFormData({
      body: normalized.body,
      attachments: normalized.attachments,
    }), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  contact: async (data: ContactTicketPayload): Promise<ContactSubmissionResponse> => {
    const res = await api.post('/contact', buildSupportFormData({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      category: data.category,
      priority: data.priority,
      attachments: data.attachments,
    }), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return {
      ticket: res.data.data,
      guestAccessToken: res.data.meta?.guestAccessToken,
    }
  },

  getGuest: async (ticketNumber: string, token: string): Promise<SupportTicket> => {
    const res = await api.get(`/support/guest/${ticketNumber}`, { params: { token } })
    return res.data.data
  },

  replyGuest: async (ticketNumber: string, token: string, payload: string | SupportMessagePayload): Promise<SupportTicket> => {
    const normalized = typeof payload === 'string' ? { body: payload } : payload
    const res = await api.post(`/support/guest/${ticketNumber}/reply`, buildSupportFormData({
      body: normalized.body,
      attachments: normalized.attachments,
    }), {
      params: { token },
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },
}
