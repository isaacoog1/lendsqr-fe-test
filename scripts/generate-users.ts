/**
 * Generates the mock dataset served by the users endpoint.
 *
 * Run with `npm run generate:users`. The output is committed so that the app,
 * its tests and a fresh clone all work with no network and no setup. Faker is a
 * devDependency and this script never reaches the browser bundle.
 *
 * The seed is fixed, so regenerating produces a byte-identical file — a change
 * to the dataset only ever appears in a diff when the shape or seed changes.
 */
import { faker } from '@faker-js/faker'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { User } from '../src/types/user.ts'

const SEED = 42
const RECORD_COUNT = 500
const OUTPUT_PATH = join(import.meta.dirname, '..', 'public', 'api')

// Join dates are generated relative to this instead of "now". The seed alone
// is not enough for a reproducible file: faker.date.past() counts back from
// the current clock, so every run produced a different set of timestamps.
const REFERENCE_DATE = new Date('2026-06-01T00:00:00.000Z')

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

const STATUSES: User['status'][] = [
  'active',
  'inactive',
  'pending',
  'blacklisted',
]

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

const BANKS = [
  'Providus Bank',
  'GTBank',
  'First Bank',
  'Access Bank',
  'UBA',
  'Zenith Bank',
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
    dateJoined: faker.date
      .past({ years: 3, refDate: REFERENCE_DATE })
      .toISOString(),
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
    bankName: faker.helpers.arrayElement(BANKS),
    tier: faker.helpers.arrayElement([1, 2, 3]),

    hasLoan: faker.datatype.boolean({ probability: 0.35 }),
    hasSavings: faker.datatype.boolean({ probability: 0.55 }),
  }
}

faker.seed(SEED)
const users = Array.from({ length: RECORD_COUNT }, generateUser)

mkdirSync(OUTPUT_PATH, { recursive: true })
writeFileSync(
  join(OUTPUT_PATH, 'users.json'),
  `${JSON.stringify(users, null, 2)}\n`,
)

console.log(
  `Generated ${users.length} users → public/api/users.json`,
  `\n  with loans:   ${users.filter((user) => user.hasLoan).length}`,
  `\n  with savings: ${users.filter((user) => user.hasSavings).length}`,
)
