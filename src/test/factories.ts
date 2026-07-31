import type { User } from '@/types'

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
