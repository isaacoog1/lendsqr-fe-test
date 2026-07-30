import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getSelectedUser } from '@/utils'
import { useUser } from '@/hooks'
import { UserProfileHeader } from '@/components/features/UserProfileHeader'
import { Button, ErrorState, Skeleton } from '@/components/ui'
import {
  GeneralDetails,
  Documents,
  BankDetails,
  Loans,
  Savings,
  AppAndSystem,
} from './sections'
import styles from './UserDetailsPage.module.scss'

const TABS = [
  { key: 'general', label: 'General Details' },
  { key: 'documents', label: 'Documents' },
  { key: 'bank', label: 'Bank Details' },
  { key: 'loans', label: 'Loans' },
  { key: 'savings', label: 'Savings' },
  { key: 'app', label: 'App and System' },
]

function UserDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('general')

  const cachedUser = getSelectedUser()
  const shouldFetch = !cachedUser || cachedUser.id !== id
  const {
    data: fetchedUser,
    isLoading,
    isError,
  } = useUser(shouldFetch ? id! : '')

  const user = shouldFetch ? fetchedUser : cachedUser

  if (isLoading && shouldFetch) {
    return (
      <div className={styles.page}>
        <Skeleton width="120px" height="16px" />
        <div className={styles.skeletonHeader}>
          <Skeleton variant="circular" width="100px" height="100px" />
          <div>
            <Skeleton width="200px" height="24px" />
            <Skeleton width="100px" height="14px" />
          </div>
        </div>
        <Skeleton height="300px" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className={styles.page}>
        <Link to="/users" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Users</span>
        </Link>
        <ErrorState
          title="User not found"
          message="The user you're looking for doesn't exist or has been removed."
          action={
            <Link to="/users">
              <Button>Back to Users</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Link to="/users" className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to Users</span>
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>User Details</h1>
        <div className={styles.actions}>
          <Button variant="danger" size="sm">
            BLACKLIST USER
          </Button>
          <Button variant="primary" size="sm">
            ACTIVATE USER
          </Button>
        </div>
      </div>

      <UserProfileHeader
        user={user}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className={styles.content}>
        {activeTab === 'general' && <GeneralDetails user={user} />}
        {activeTab === 'documents' && <Documents />}
        {activeTab === 'bank' && <BankDetails user={user} />}
        {activeTab === 'loans' && <Loans user={user} />}
        {activeTab === 'savings' && <Savings user={user} />}
        {activeTab === 'app' && <AppAndSystem />}
      </div>
    </div>
  )
}

export default UserDetailsPage
