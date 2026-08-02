import type { UserSortField } from '@/types'

/**
 * The fields the users endpoint will sort on — anything else is a 400.
 *
 * It lives here rather than beside the service because both the table and the
 * URL parser match column ids and query strings against it, and tests mock the
 * service module wholesale.
 */
export const USER_SORT_FIELDS = [
  'organization',
  'username',
  'email',
  'phoneNumber',
  'dateJoined',
  'status',
] as const satisfies readonly UserSortField[]
