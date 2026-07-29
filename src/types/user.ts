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
}
