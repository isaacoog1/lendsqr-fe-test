import type { UserStatus } from '@/types'

export type UserStatusAction = 'blacklist' | 'activate' | 'deactivate'

/** Which status-change actions apply to a user, in display order. */
export function getStatusActions(status: UserStatus): UserStatusAction[] {
  switch (status) {
    case 'active':
      return ['blacklist', 'deactivate']
    case 'inactive':
    case 'pending':
      return ['activate', 'blacklist']
    case 'blacklisted':
      return ['activate']
  }
}
