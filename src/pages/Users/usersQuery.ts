import { z } from 'zod/v4'
import type { FilterFormData } from '@/components/features/UserFilters'
import { USER_SORT_FIELDS } from '@/constants'
import type { UsersQuery } from '@/services/users.service'
import type { UserStatus } from '@/types'

export const DEFAULT_PAGE_SIZE = 20

/** The API's own ceiling. Asking for more is a 400, not a clamp. */
const MAX_PAGE_SIZE = 100

const STATUSES = [
  'active',
  'inactive',
  'pending',
  'blacklisted',
] as const satisfies readonly UserStatus[]

/** The filter fields, in the order the panel shows them. */
export const FILTER_KEYS = [
  'organization',
  'username',
  'email',
  'phoneNumber',
  'dateJoined',
  'status',
] as const

/** Trimmed, with a blank treated as absent. */
const text = z.string().trim().min(1).optional().catch(undefined)

/**
 * The whole query lives in the URL, which means every value here is something
 * a person can type. Anything the API would reject is dropped rather than
 * forwarded: a hand-edited `?sortBy=nonsense` should show the default order,
 * not an error screen. `.catch()` on each field is what makes this total — the
 * schema never throws, it falls back.
 */
const querySchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  perPage: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .catch(DEFAULT_PAGE_SIZE),
  sortBy: z.enum(USER_SORT_FIELDS).optional().catch(undefined),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
  q: text,
  organization: text,
  username: text,
  email: text,
  phoneNumber: text,
  // The API expects a calendar day; anything else is a 400.
  dateJoined: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
  status: z.enum(STATUSES).optional().catch(undefined),
})

/**
 * Reads the table's full state out of the URL. Every field is spelled out
 * rather than spread, because zod drops optional keys that were absent from
 * the input and a query whose shape changes with the URL is a poor cache key.
 */
export function parseUsersQuery(searchParams: URLSearchParams): UsersQuery {
  const parsed = querySchema.parse(Object.fromEntries(searchParams.entries()))

  return {
    page: parsed.page,
    perPage: parsed.perPage,
    sortBy: parsed.sortBy,
    sortOrder: parsed.sortOrder,
    // The header search box has always submitted to `?q=`; the API calls the
    // same thing `search`.
    search: parsed.q,
    organization: parsed.organization,
    username: parsed.username,
    email: parsed.email,
    phoneNumber: parsed.phoneNumber,
    dateJoined: parsed.dateJoined,
    status: parsed.status,
  }
}

/** Seeds the filter form so reopening the panel shows what is applied. */
export function toFilterValues(query: UsersQuery): FilterFormData {
  return {
    organization: query.organization ?? '',
    username: query.username ?? '',
    email: query.email ?? '',
    phoneNumber: query.phoneNumber ?? '',
    dateJoined: query.dateJoined ?? '',
    status: query.status ?? '',
  }
}

export function hasActiveFilters(query: UsersQuery): boolean {
  return FILTER_KEYS.some((key) => !!query[key])
}
