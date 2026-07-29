import { Avatar, Tabs } from '@/components/ui'
import { TierStars } from '@/components/features/TierStars'
import type { User } from '@/types'
import styles from './UserProfileHeader.module.scss'

interface UserProfileHeaderProps {
  user: User
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: { key: string; label: string }[]
}

function UserProfileHeader({
  user,
  activeTab,
  onTabChange,
  tabs,
}: UserProfileHeaderProps) {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <Avatar
          name={user.personalInfo.fullName}
          size="xl"
        />
        <div className={styles.nameSection}>
          <h2 className={styles.name}>{user.personalInfo.fullName}</h2>
          <p className={styles.id}>{user.accountNumber}</p>
        </div>

        <div className={styles.divider} />

        <div className={styles.tierSection}>
          <p className={styles.tierLabel}>User&apos;s Tier</p>
          <TierStars tier={user.tier} />
        </div>

        <div className={styles.divider} />

        <div className={styles.balanceSection}>
          <h2 className={styles.balance}>{user.accountBalance}</h2>
          <p className={styles.bank}>
            {user.accountNumber}/{user.bankName}
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />
    </div>
  )
}

export default UserProfileHeader
