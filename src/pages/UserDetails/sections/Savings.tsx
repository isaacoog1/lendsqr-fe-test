import { InfoGrid } from '@/components/features/InfoGrid'
import type { User } from '@/types'
import styles from './sections.module.scss'

interface SavingsProps {
  user: User
}

function Savings({ user }: SavingsProps) {
  return (
    <div className={styles.section}>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Savings Information</h3>
        <InfoGrid
          items={[
            { label: 'ACCOUNT BALANCE', value: user.accountBalance },
            { label: 'BANK NAME', value: user.bankName },
          ]}
        />
      </div>
    </div>
  )
}

export default Savings
