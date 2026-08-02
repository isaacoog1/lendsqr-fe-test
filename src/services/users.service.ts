import { apiClient } from '@/api/client'
import { config } from '@/config/env'
import type {
  ApiResponse,
  PaginatedUsers,
  SortOrder,
  User,
  UserSortField,
  UserStats,
  UserStatus,
} from '@/types'

/**
 * Every parameter the list endpoint accepts. Pagination, sorting and filtering
 * all happen server-side, so this object is the complete description of what
 * the table is showing.
 */
export interface UsersQuery {
  page?: number
  perPage?: number
  sortBy?: UserSortField
  sortOrder?: SortOrder
  /** Spans organization, username, email and phone number. */
  search?: string
  organization?: string
  username?: string
  email?: string
  phoneNumber?: string
  /** A calendar day, `YYYY-MM-DD`. */
  dateJoined?: string
  status?: UserStatus
}

/**
 * The filter form submits all six of its fields whether or not they were
 * filled in, and axios keeps empty strings in the query string. The API
 * rejects a blank `status` rather than ignoring it, so unset values are
 * dropped before the request goes out.
 */
function withoutBlanks(query: UsersQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {}

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params[key] = value
    }
  }

  return params
}

/**
 * The list endpoint returns a summary per user, the details endpoint the full
 * record. `data.data` unwraps the response envelope; doing that in the
 * response interceptor instead would silently mangle any endpoint that does
 * not use it, and three call sites is not enough repetition to justify hiding
 * the wire format.
 */
export const usersService = {
  async list(query: UsersQuery = {}): Promise<PaginatedUsers> {
    const { data } = await apiClient.get<ApiResponse<PaginatedUsers>>(
      config.usersPath,
      { params: withoutBlanks(query) },
    )
    return data.data
  },

  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>(
      `${config.usersPath}/${id}`,
    )
    return data.data
  },

  async getStats(): Promise<UserStats> {
    const { data } = await apiClient.get<ApiResponse<UserStats>>(
      `${config.usersPath}/stats`,
    )
    return data.data
  },
}
