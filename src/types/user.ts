import type { Pagination } from './api'

export type UserStatus = 'active' | 'inactive' | 'pending' | 'blacklisted'

export interface UserGuarantor {
  fullName: string
  phoneNumber: string
  emailAddress: string
  relationship: string
}

export interface User {
  id: string
  organization: string
  username: string
  email: string
  phoneNumber: string
  dateJoined: string
  status: UserStatus

  personalInfo: {
    fullName: string
    bvn: string
    gender: string
    maritalStatus: string
    children: string
    typeOfResidence: string
  }

  educationAndEmployment: {
    levelOfEducation: string
    employmentStatus: string
    sectorOfEmployment: string
    durationOfEmployment: string
    officeEmail: string
    monthlyIncome: string
    loanRepayment: string
  }

  socials: {
    twitter: string
    facebook: string
    instagram: string
  }

  guarantor: UserGuarantor

  accountBalance: string
  accountNumber: string
  bankName: string
  tier: number

  hasLoan: boolean
  hasSavings: boolean
}

/**
 * What the list endpoint returns: the id plus the six columns the table
 * renders. Expressed as a slice of `User` so the two contracts cannot drift —
 * the details endpoint returns the whole record.
 */
export type UserSummary = Pick<
  User,
  | 'id'
  | 'organization'
  | 'username'
  | 'email'
  | 'phoneNumber'
  | 'dateJoined'
  | 'status'
>

export interface PaginatedUsers {
  users: UserSummary[]
  pagination: Pagination
}

/** The fields the list endpoint sorts on — every visible column. */
export type UserSortField = Exclude<keyof UserSummary, 'id'>

export type SortOrder = 'asc' | 'desc'

export interface StatusBreakdownRow {
  status: UserStatus
  count: number
  /** Share of all users, rounded to a whole percent. */
  percentage: number
}

export interface OrganizationRow {
  organization: string
  count: number
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  usersWithLoans: number
  usersWithSavings: number
  statusBreakdown: StatusBreakdownRow[]
  topOrganizations: OrganizationRow[]
  /** Populates the filter dropdown without loading every user to find them. */
  organizations: string[]
}
