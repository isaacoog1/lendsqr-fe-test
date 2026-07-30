import { faker } from '@faker-js/faker'
import type { User, UserStatus } from '@/types'

const ORGANIZATIONS = [
  'Lendsqr',
  'Lendstar',
  'Irorun',
  'Paystack',
  'Flutterwave',
  'Kuda',
  'PiggyVest',
  'Cowrywise',
  'Carbon',
  'FairMoney',
]

const STATUSES: UserStatus[] = ['active', 'inactive', 'pending', 'blacklisted']

const EDUCATION_LEVELS = ['B.Sc', 'M.Sc', 'PhD', 'HND', 'OND', 'SSCE']

const EMPLOYMENT_STATUSES = [
  'Employed',
  'Self-employed',
  'Unemployed',
  'Student',
  'Retired',
]

const SECTORS = [
  'FinTech',
  'Banking',
  'Technology',
  'Education',
  'Healthcare',
  'Agriculture',
  'Real Estate',
  'Retail',
]

const RELATIONSHIPS = [
  'Sister',
  'Brother',
  'Mother',
  'Father',
  'Friend',
  'Spouse',
]

const RESIDENCES = [
  "Parent's Apartment",
  'Personal Apartment',
  'Rented Apartment',
  'Shared Apartment',
]

function generateUser(): User {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const fullName = `${firstName} ${lastName}`

  return {
    id: faker.string.uuid(),
    organization: faker.helpers.arrayElement(ORGANIZATIONS),
    username: faker.internet.username({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phoneNumber: `0${faker.string.numeric(10)}`,
    dateJoined: faker.date.past({ years: 3 }).toISOString(),
    status: faker.helpers.arrayElement(STATUSES),

    personalInfo: {
      fullName,
      bvn: faker.string.numeric(11),
      gender: faker.helpers.arrayElement(['Male', 'Female']),
      maritalStatus: faker.helpers.arrayElement([
        'Single',
        'Married',
        'Divorced',
        'Widowed',
      ]),
      children: faker.helpers.arrayElement(['None', '1', '2', '3', '4', '5+']),
      typeOfResidence: faker.helpers.arrayElement(RESIDENCES),
    },

    educationAndEmployment: {
      levelOfEducation: faker.helpers.arrayElement(EDUCATION_LEVELS),
      employmentStatus: faker.helpers.arrayElement(EMPLOYMENT_STATUSES),
      sectorOfEmployment: faker.helpers.arrayElement(SECTORS),
      durationOfEmployment: `${faker.number.int({ min: 1, max: 15 })} years`,
      officeEmail: faker.internet.email().toLowerCase(),
      monthlyIncome: `₦${faker.number.int({ min: 100000, max: 900000 }).toLocaleString()}.00 - ₦${faker.number.int({ min: 200000, max: 1000000 }).toLocaleString()}.00`,
      loanRepayment: faker.number
        .int({ min: 10000, max: 200000 })
        .toLocaleString(),
    },

    socials: {
      twitter: `@${faker.internet.username({ firstName })}`,
      facebook: fullName,
      instagram: `@${faker.internet.username({ firstName })}`,
    },

    guarantor: {
      fullName: faker.person.fullName(),
      phoneNumber: `0${faker.string.numeric(10)}`,
      emailAddress: faker.internet.email().toLowerCase(),
      relationship: faker.helpers.arrayElement(RELATIONSHIPS),
    },

    accountBalance: `₦${faker.number.int({ min: 50000, max: 500000 }).toLocaleString()}.00`,
    accountNumber: faker.string.numeric(10),
    bankName: faker.helpers.arrayElement([
      'Providus Bank',
      'GTBank',
      'First Bank',
      'Access Bank',
      'UBA',
      'Zenith Bank',
    ]),
    tier: faker.helpers.arrayElement([1, 2, 3]),
  }
}

export function generateUsers(count = 500): User[] {
  faker.seed(42)
  return Array.from({ length: count }, generateUser)
}
