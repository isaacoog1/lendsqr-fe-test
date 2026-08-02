import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getSelectedUser, getStatusActions, type UserStatusAction } from '@/utils'
import { useUser } from '@/hooks'
import { UserProfileHeader } from '@/components/features/UserProfileHeader'
import {
  Button,
  ErrorState,
  tabId,
  tabPanelId,
  type ButtonVariant,
} from '@/components/ui'
import {
  GeneralDetails,
  Documents,
  BankDetails,
  Loans,
  Savings,
  AppAndSystem,
} from './sections'
import UserDetailsSkeleton from './UserDetailsSkeleton'
import styles from './UserDetailsPage.module.scss'

const TAB_ID_PREFIX = 'user-details'

const ACTION_META: Record<
  UserStatusAction,
  { label: string; variant: ButtonVariant }
> = {
  blacklist: { label: 'BLACKLIST USER', variant: 'danger' },
  activate: { label: 'ACTIVATE USER', variant: 'outlinePrimary' },
  deactivate: { label: 'DEACTIVATE USER', variant: 'outline' },
}

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

  // Read once per mount, not on every re-render. The list only carries a
  // summary, so this names who is loading rather than standing in for them.
  const [selected] = useState(getSelectedUser)

  const { data: user, isLoading, isError, error, refetch } = useUser(id)

  if (isLoading) {
    // The selection carries a username, so the skeleton can say whose record
    // is on its way instead of announcing an anonymous wait.
    const label =
      selected && selected.id === id
        ? `Loading ${selected.username}`
        : 'Loading user details'

    return <UserDetailsSkeleton label={label} />
  }

  if (isError || !user) {
    // A missing record and an unreachable network are different problems: one
    // is permanent, the other is worth retrying. Reporting both as "not found"
    // tells the user not to retry at exactly the moment retrying would work.
    const isMissing = !isError || error?.status === 404

    return (
      <div className={styles.page}>
        <Link to="/users" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Users</span>
        </Link>
        {isMissing ? (
          <ErrorState
            title="User not found"
            message="The user you're looking for doesn't exist or has been removed."
            action={
              <Link to="/users">
                <Button>Back to Users</Button>
              </Link>
            }
          />
        ) : (
          <ErrorState
            title="Failed to load user"
            message={
              error?.message ?? "We couldn't fetch this user. Please try again."
            }
            action={<Button onClick={() => refetch()}>Retry</Button>}
          />
        )}
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
          {getStatusActions(user.status).map((action) => (
            <Button key={action} variant={ACTION_META[action].variant} size="sm">
              {ACTION_META[action].label}
            </Button>
          ))}
        </div>
      </div>

      <UserProfileHeader
        user={user}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabIdPrefix={TAB_ID_PREFIX}
      />

      <div
        className={styles.content}
        role="tabpanel"
        id={tabPanelId(TAB_ID_PREFIX, activeTab)}
        aria-labelledby={tabId(TAB_ID_PREFIX, activeTab)}
        tabIndex={0}
      >
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
