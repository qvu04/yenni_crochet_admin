import { supabase } from './supabase'

export type CustomRequestStatus = 'pending' | 'contacted' | 'completed' | 'cancelled'
export type CustomRequestStatusFilter = 'all' | CustomRequestStatus

export interface CustomRequest {
  id: string
  customer_name: string
  phone: string
  description: string | null
  reference_images: string[] | null
  zalo_user_id: string | null
  status: CustomRequestStatus
  quantity: number
  occasion: string | null
  preferred_colors: string | null
  note: string | null
  created_at: string
}

export interface CustomRequestFilters {
  search?: string
  status?: CustomRequestStatusFilter
}

const CUSTOM_REQUEST_SELECT = `
  id,
  customer_name,
  phone,
  description,
  reference_images,
  zalo_user_id,
  status,
  quantity,
  occasion,
  preferred_colors,
  note,
  created_at
`

const normalizeSearchTerm = (value: string) => value.trim().replace(/[,%()]/g, ' ').replace(/\s+/g, ' ')

export const customRequestServices = {
  getCustomRequests: async ({ search, status = 'all' }: CustomRequestFilters): Promise<CustomRequest[]> => {
    let query = supabase
      .from('custom_requests')
      .select(CUSTOM_REQUEST_SELECT)
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (search?.trim()) {
      const keyword = normalizeSearchTerm(search)
      if (keyword) {
        query = query.or(`customer_name.ilike.%${keyword}%,phone.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      }
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []) as CustomRequest[]
  },

  updateCustomRequestStatus: async (
    requestId: string,
    status: CustomRequestStatus,
  ): Promise<CustomRequest> => {
    const { data, error } = await supabase
      .from('custom_requests')
      .update({ status })
      .eq('id', requestId)
      .select(CUSTOM_REQUEST_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data as CustomRequest
  },
}
