import { Users, UserCheck, FileText, Coins } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserStats } from '@/types'

export interface DashboardStat {
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  label: string
  getValue: (stats: UserStats) => string
}

/**
 * Shared by the Dashboard and Users pages. Every figure is counted server-side
 * over all 500 records, so the cards report platform totals and do not move
 * when the table below them is filtered.
 */
export const dashboardStats: DashboardStat[] = [
  {
    icon: Users,
    iconColor: '#DF18FF',
    iconBgColor: '#DF18FF1A',
    label: 'USERS',
    getValue: (stats) => stats.totalUsers.toLocaleString(),
  },
  {
    icon: UserCheck,
    iconColor: '#5718FF',
    iconBgColor: '#5718FF1A',
    label: 'ACTIVE USERS',
    getValue: (stats) => stats.activeUsers.toLocaleString(),
  },
  {
    icon: FileText,
    iconColor: '#F55F44',
    iconBgColor: '#F55F441A',
    label: 'USERS WITH LOANS',
    getValue: (stats) => stats.usersWithLoans.toLocaleString(),
  },
  {
    icon: Coins,
    iconColor: '#FF3366',
    iconBgColor: '#FF33661A',
    label: 'USERS WITH SAVINGS',
    getValue: (stats) => stats.usersWithSavings.toLocaleString(),
  },
]
