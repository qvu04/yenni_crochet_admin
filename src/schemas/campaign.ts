import { z } from 'zod'

export const campaignTypeSchema = z.enum(['collection', 'event', 'promotion'])
export const campaignCtaActionSchema = z.enum(['products', 'contact', 'custom_request'])

export const campaignFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Tên campaign là bắt buộc'),
    subtitle: z.string().trim().optional(),
    description: z.string().trim().optional(),
    content: z.string().trim().optional(),
    banner_url: z.string().trim().url('Link banner không hợp lệ'),
    detail_image_url: z.string().trim().url('Link ảnh chi tiết không hợp lệ').optional().or(z.literal('')),
    campaign_type: campaignTypeSchema,
    event_location: z.string().trim().optional(),
    start_date: z.string().trim().min(1, 'Ngày bắt đầu là bắt buộc'),
    end_date: z.string().trim().min(1, 'Ngày kết thúc là bắt buộc'),
    start_at: z.string().trim().optional(),
    end_at: z.string().trim().optional(),
    cta_label: z.string().trim().optional(),
    cta_action: campaignCtaActionSchema,
    is_active: z.boolean(),
    product_ids: z.array(z.string()),
  })
  .refine((values) => new Date(values.end_date) >= new Date(values.start_date), {
    path: ['end_date'],
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
  })

export type CampaignFormValues = z.infer<typeof campaignFormSchema>
export type CampaignType = z.infer<typeof campaignTypeSchema>
export type CampaignCtaAction = z.infer<typeof campaignCtaActionSchema>
