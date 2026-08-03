import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  rememberEmail: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
