import { InfoGrid } from '@/components/features/InfoGrid'
import type { User } from '@/types'
import styles from './sections.module.scss'

interface LoansProps {
  user: User
}

function Loans({ user }: LoansProps) {
  return (
    <div className={styles.section}>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Loan Information</h3>
        <InfoGrid
          items={[
            {
              label: 'LOAN REPAYMENT',
              value: user.educationAndEmployment.loanRepayment,
            },
            {
              label: 'MONTHLY INCOME',
              value: user.educationAndEmployment.monthlyIncome,
            },
          ]}
        />
      </div>
    </div>
  )
}

export default Loans
