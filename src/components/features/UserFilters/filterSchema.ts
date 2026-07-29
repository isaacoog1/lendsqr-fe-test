import { z } from 'zod/v4'

export const filterSchema = z.object({
  organization: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateJoined: z.string().optional(),
  status: z.string().optional(),
})

export type FilterFormData = z.infer<typeof filterSchema>

export const EMPTY_FILTERS: FilterFormData = {
  organization: '',
  username: '',
  email: '',
  phoneNumber: '',
  dateJoined: '',
  status: '',
}
