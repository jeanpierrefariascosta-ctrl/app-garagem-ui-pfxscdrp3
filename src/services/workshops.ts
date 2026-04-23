import pb from '@/lib/pocketbase/client'

export interface Workshop {
  id: string
  user: string
  name: string
  cnpj: string
  address?: string
  lat?: number
  lng?: number
  services?: string[]
  opening_hours?: string
  score?: number
  is_active: boolean
  created: string
  updated: string
}

export const getWorkshopByUser = async (userId: string): Promise<Workshop | null> => {
  try {
    return await pb.collection('workshops').getFirstListItem<Workshop>(`user="${userId}"`)
  } catch {
    return null
  }
}
