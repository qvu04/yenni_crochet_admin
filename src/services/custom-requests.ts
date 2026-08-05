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
  expected_date: string | null
  budget_range: string | null
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
  expected_date,
  budget_range,
  note,
  created_at
`

const CUSTOM_REQUEST_FALLBACK_SELECT = `
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

const isMissingColumnError = (error: { code?: string; message?: string } | null) =>
  error?.code === '42703' || error?.message?.toLowerCase().includes('column') === true

const withCustomRequestDefaults = (request: Partial<CustomRequest>): CustomRequest => ({
  expected_date: null,
  budget_range: null,
  ...request,
} as CustomRequest)

const buildCustomRequestsQuery = (select: string, { search, status = 'all' }: CustomRequestFilters) => {
  let query = supabase
    .from('custom_requests')
    .select(select)
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

  return query
}

export const customRequestServices = {
  getCustomRequests: async ({ search, status = 'all' }: CustomRequestFilters): Promise<CustomRequest[]> => {
    const result = await buildCustomRequestsQuery(CUSTOM_REQUEST_SELECT, { search, status })
    let data: unknown = result.data
    let error = result.error

    if (isMissingColumnError(error)) {
      const fallbackResult = await buildCustomRequestsQuery(CUSTOM_REQUEST_FALLBACK_SELECT, { search, status })
      data = fallbackResult.data
      error = fallbackResult.error
    }

    if (error) {
      throw new Error(error.message)
    }

    return ((data ?? []) as Partial<CustomRequest>[]).map(withCustomRequestDefaults)
  },

  updateCustomRequestStatus: async (
    requestId: string,
    status: CustomRequestStatus,
  ): Promise<CustomRequest> => {
    const result = await supabase
      .from('custom_requests')
      .update({ status })
      .eq('id', requestId)
      .select(CUSTOM_REQUEST_SELECT)
      .single()
    let data: unknown = result.data
    let error = result.error

    if (isMissingColumnError(error)) {
      const fallbackResult = await supabase
        .from('custom_requests')
        .update({ status })
        .eq('id', requestId)
        .select(CUSTOM_REQUEST_FALLBACK_SELECT)
        .single()

      data = fallbackResult.data
      error = fallbackResult.error
    }

    if (error) {
      throw new Error(error.message)
    }

    return withCustomRequestDefaults(data as Partial<CustomRequest>)
  },
}
