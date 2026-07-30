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
      users.filter((u) => u.status === 'active').length.toLocaleString(),
  },
  {
    icon: FileText,
    iconColor: '#F55F44',
    iconBgColor: '#F55F441A',
    label: 'USERS WITH LOANS',
    getValue: (users) => Math.floor(users.length * 0.25).toLocaleString(),
  },
  {
    icon: Coins,
    iconColor: '#FF3366',
    iconBgColor: '#FF33661A',
    label: 'USERS WITH SAVINGS',
    getValue: (users) => Math.floor(users.length * 0.2).toLocaleString(),
  },
]
