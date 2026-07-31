import { Users, UserCheck, FileText, Coins } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { User } from '@/types'

export interface DashboardStat {
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  label: string
  getValue: (users: User[]) => string
}

/**
 * Shared by the Dashboard and Users pages. Every value is counted from the
 * dataset — none are hardcoded or derived from an assumed ratio.
 */
export const dashboardStats: DashboardStat[] = [
  {
    icon: Users,
    iconColor: '#DF18FF',
    iconBgColor: '#DF18FF1A',
    label: 'USERS',
    getValue: (users) => users.length.toLocaleString(),
  },
  {
    icon: UserCheck,
    iconColor: '#5718FF',
    iconBgColor: '#5718FF1A',
    label: 'ACTIVE USERS',
    getValue: (users) =>
      users.filter((user) => user.status === 'active').length.toLocaleString(),
  },
  {
    icon: FileText,
    iconColor: '#F55F44',
    iconBgColor: '#F55F441A',
    label: 'USERS WITH LOANS',
    getValue: (users) =>
      users.filter((user) => user.hasLoan).length.toLocaleString(),
  },
  {
    icon: Coins,
    iconColor: '#FF3366',
    iconBgColor: '#FF33661A',
    label: 'USERS WITH SAVINGS',
    getValue: (users) =>
      users.filter((user) => user.hasSavings).length.toLocaleString(),
  },
]
