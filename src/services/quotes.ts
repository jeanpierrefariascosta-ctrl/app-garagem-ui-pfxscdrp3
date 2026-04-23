import pb from '@/lib/pocketbase/client'

export interface Quote {
  id: string
  user: string
  vehicle: string
  items_requested: string[]
  status: 'open' | 'in_progress' | 'completed' | 'expired'
  expires_at: string
  lat?: number
  lng?: number
  created: string
  updated: string
  expand?: {
    vehicle?: any
  }
}

export interface Proposal {
  id: string
  quote: string
  workshop_name: string
  total_value: number
  estimated_hours?: number
  items_included?: string[]
  notes?: string
  status: 'pending' | 'accepted' | 'rejected'
  created: string
  updated: string
}

export const createQuote = (data: Partial<Quote>) => pb.collection('quotes').create<Quote>(data)
export const getQuote = (id: string) =>
  pb.collection('quotes').getOne<Quote>(id, { expand: 'vehicle' })
export const updateQuote = (id: string, data: Partial<Quote>) =>
  pb.collection('quotes').update<Quote>(id, data)

export const createProposal = (data: Partial<Proposal>) =>
  pb.collection('proposals').create<Proposal>(data)
export const getProposalsByQuote = (quoteId: string) =>
  pb.collection('proposals').getFullList<Proposal>({ filter: `quote="${quoteId}"` })
