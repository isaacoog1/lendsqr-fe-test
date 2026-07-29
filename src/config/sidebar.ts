import type { LucideIcon } from 'lucide-react'
import {
  Home,
  Users,
  UserCheck,
  HandCoins,
  PiggyBank,
  Handshake,
  ScrollText,
  UserX,
  Building2,
  CreditCard,
  Landmark,
  Coins,
  ArrowRightLeft,
  Globe,
  UserCog,
  ClipboardList,
  ReceiptText,
  Sliders,
  BadgeDollarSign,
  FileText,
  BadgePercent,
  BookOpen,
} from 'lucide-react'

export interface SidebarItem {
  label: string
  path: string
  icon: LucideIcon
}

export interface SidebarGroup {
  title: string
  items: SidebarItem[]
}

export const sidebarConfig: SidebarGroup[] = [
  {
    title: 'CUSTOMERS',
    items: [
      { label: 'Users', path: '/users', icon: Users },
      { label: 'Guarantors', path: '/guarantors', icon: UserCheck },
      { label: 'Loans', path: '/loans', icon: HandCoins },
      { label: 'Decision Models', path: '/decision-models', icon: Handshake },
      { label: 'Savings', path: '/savings', icon: PiggyBank },
      { label: 'Loan Requests', path: '/loan-requests', icon: ScrollText },
      { label: 'Whitelist', path: '/whitelist', icon: UserCheck },
      { label: 'Karma', path: '/karma', icon: UserX },
    ],
  },
  {
    title: 'BUSINESSES',
    items: [
      { label: 'Organization', path: '/organization', icon: Building2 },
      { label: 'Loan Products', path: '/loan-products', icon: CreditCard },
      { label: 'Savings Products', path: '/savings-products', icon: Landmark },
      { label: 'Fees and Charges', path: '/fees-charges', icon: Coins },
      { label: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
      { label: 'Services', path: '/services', icon: Globe },
      { label: 'Service Account', path: '/service-account', icon: UserCog },
      { label: 'Settlements', path: '/settlements', icon: ReceiptText },
      { label: 'Reports', path: '/reports', icon: ClipboardList },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { label: 'Preferences', path: '/preferences', icon: Sliders },
      { label: 'Fees and Pricing', path: '/fees-pricing', icon: BadgeDollarSign },
      { label: 'Audit Logs', path: '/audit-logs', icon: FileText },
      { label: 'Systems Messages', path: '/systems-messages', icon: BadgePercent },
    ],
  },
]

export const dashboardItem: SidebarItem = {
  label: 'Dashboard',
  path: '/dashboard',
  icon: Home,
}

export const switchOrgItem = {
  label: 'Switch Organization',
  icon: BookOpen,
}
