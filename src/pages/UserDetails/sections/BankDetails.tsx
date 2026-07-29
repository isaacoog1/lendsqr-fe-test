import { InfoGrid } from '@/components/features/InfoGrid'
import type { User } from '@/types'
import styles from './sections.module.scss'

interface BankDetailsProps {
  user: User
}

function BankDetails({ user }: BankDetailsProps) {
  return (
    <div className={styles.section}>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Bank Information</h3>
        <InfoGrid
          items={[
            { label: 'ACCOUNT BALANCE', value: user.accountBalance },
            { label: 'ACCOUNT NUMBER', value: user.accountNumber },
            { label: 'BANK NAME', value: user.bankName },
          ]}
        />
      </div>
    </div>
  )
}

export default BankDetails
