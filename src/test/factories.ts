import type {
  PaginatedUsers,
  Pagination,
  User,
  UserStats,
  UserSummary,
} from '@/types'

let sequence = 0

/**
 * Builds a complete `User` so tests only have to state the fields they care
 * about. Values are deterministic — pass overrides for anything asserted on.
 */
export function buildUser(overrides: Partial<User> = {}): User {
  sequence += 1

  return {
    id: `user-${sequence}`,
    organization: 'Lendsqr',
    username: `user${sequence}`,
    email: `user${sequence}@lendsqr.com`,
    phoneNumber: '08078903721',
    dateJoined: '2020-05-15T10:00:00.000Z',
    status: 'active',

    personalInfo: {
      fullName: 'Grace Effiom',
      bvn: '07060780922',
      gender: 'Female',
      maritalStatus: 'Single',
      children: 'None',
      typeOfResidence: "Parent's Apartment",
    },

    educationAndEmployment: {
      levelOfEducation: 'B.Sc',
      employmentStatus: 'Employed',
      sectorOfEmployment: 'FinTech',
      durationOfEmployment: '2 years',
      officeEmail: 'grace@lendsqr.com',
      monthlyIncome: '₦200,000.00 - ₦400,000.00',
      loanRepayment: '40,000',
    },

    socials: {
      twitter: '@grace_effiom',
      facebook: 'Grace Effiom',
      instagram: '@grace_effiom',
    },

    guarantor: {
      fullName: 'Debby Ogana',
      phoneNumber: '07060780922',
      emailAddress: 'debby@gmail.com',
      relationship: 'Sister',
    },

    accountBalance: '₦200,000.00',
    accountNumber: '9912345678',
    bankName: 'Providus Bank',
    tier: 1,

    hasLoan: false,
    hasSavings: false,

    ...overrides,
  }
}

/** Builds `count` users, applying `overrides` to each. */
export function buildUsers(
  count: number,
  overrides: Partial<User> = {},
): User[] {
  return Array.from({ length: count }, () => buildUser(overrides))
}

/** One row as the list endpoint returns it — no nested detail sections. */
export function buildUserSummary(
  overrides: Partial<UserSummary> = {},
): UserSummary {
  const { id, organization, username, email, phoneNumber, dateJoined, status } =
    buildUser()

  return {
    id,
    organization,
    username,
    email,
    phoneNumber,
    dateJoined,
    status,
    ...overrides,
  }
}

export function buildUserSummaries(
  count: number,
  overrides: Partial<UserSummary> = {},
): UserSummary[] {
  return Array.from({ length: count }, () => buildUserSummary(overrides))
}

/**
 * A list response. `total` defaults to the number of rows given, so a test
 * that does not care about paging gets a coherent single page.
 */
export function buildPaginatedUsers(
  users: UserSummary[] = buildUserSummaries(3),
  pagination: Partial<Pagination> = {},
): PaginatedUsers {
  const page = pagination.page ?? 1
  const perPage = pagination.perPage ?? 20
  const total = pagination.total ?? users.length
  const totalPages = pagination.totalPages ?? Math.ceil(total / perPage)

  return {
    users,
    pagination: {
      page,
      perPage,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      ...pagination,
    },
  }
}

export function buildUserStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    totalUsers: 500,
    activeUsers: 122,
    usersWithLoans: 191,
    usersWithSavings: 289,
    statusBreakdown: [
      { status: 'active', count: 122, percentage: 24 },
      { status: 'inactive', count: 126, percentage: 25 },
      { status: 'pending', count: 121, percentage: 24 },
      { status: 'blacklisted', count: 131, percentage: 26 },
    ],
    topOrganizations: [
      { organization: 'Lendsqr', count: 63 },
      { organization: 'PiggyVest', count: 59 },
    ],
    organizations: ['Lendsqr', 'Lendstar', 'PiggyVest'],
    ...overrides,
  }
}
