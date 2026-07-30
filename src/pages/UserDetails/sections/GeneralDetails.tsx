import { InfoGrid } from '@/components/features/InfoGrid'
import type { User } from '@/types'
import styles from './sections.module.scss'

interface GeneralDetailsProps {
  user: User
}

function GeneralDetails({ user }: GeneralDetailsProps) {
  return (
    <div className={styles.section}>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Personal Information</h3>
        <InfoGrid
          items={[
            { label: 'FULL NAME', value: user.personalInfo.fullName },
            { label: 'PHONE NUMBER', value: user.phoneNumber },
            { label: 'EMAIL ADDRESS', value: user.email },
            { label: 'BVN', value: user.personalInfo.bvn },
            { label: 'GENDER', value: user.personalInfo.gender },
            { label: 'MARITAL STATUS', value: user.personalInfo.maritalStatus },
            { label: 'CHILDREN', value: user.personalInfo.children },
            {
              label: 'TYPE OF RESIDENCE',
              value: user.personalInfo.typeOfResidence,
            },
          ]}
        />
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Education and Employment</h3>
        <InfoGrid
          items={[
            {
              label: 'LEVEL OF EDUCATION',
              value: user.educationAndEmployment.levelOfEducation,
            },
            {
              label: 'EMPLOYMENT STATUS',
              value: user.educationAndEmployment.employmentStatus,
            },
            {
              label: 'SECTOR OF EMPLOYMENT',
              value: user.educationAndEmployment.sectorOfEmployment,
            },
            {
              label: 'DURATION OF EMPLOYMENT',
              value: user.educationAndEmployment.durationOfEmployment,
            },
            {
              label: 'OFFICE EMAIL',
              value: user.educationAndEmployment.officeEmail,
            },
            {
              label: 'MONTHLY INCOME',
              value: user.educationAndEmployment.monthlyIncome,
            },
            {
              label: 'LOAN REPAYMENT',
              value: user.educationAndEmployment.loanRepayment,
            },
          ]}
        />
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Socials</h3>
        <InfoGrid
          items={[
            { label: 'TWITTER', value: user.socials.twitter },
            { label: 'FACEBOOK', value: user.socials.facebook },
            { label: 'INSTAGRAM', value: user.socials.instagram },
          ]}
        />
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Guarantor</h3>
        <InfoGrid
          items={[
            { label: 'FULL NAME', value: user.guarantor.fullName },
            { label: 'PHONE NUMBER', value: user.guarantor.phoneNumber },
            { label: 'EMAIL ADDRESS', value: user.guarantor.emailAddress },
            { label: 'RELATIONSHIP', value: user.guarantor.relationship },
          ]}
        />
      </div>
    </div>
  )
}

export default GeneralDetails
