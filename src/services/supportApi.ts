import { api } from '@/lib/api'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketCategory = 'order' | 'product' | 'payment' | 'shipping' | 'general'

export interface SupportMessage {
  id: number
  ticketId: number
  customerId: number | null
  body: string
  senderType: 'customer' | 'staff'
  senderName: string | null
  createdAt: string
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
    message: string
    category: TicketCategory
  }): Promise<SupportTicket> => {
    const res = await api.post('/support/tickets', data)
    return res.data.data
  },

  reply: async (id: number, body: string): Promise<SupportTicket> => {
    const res = await api.post(`/support/tickets/${id}/reply`, { body })
    return res.data.data
  },
}
