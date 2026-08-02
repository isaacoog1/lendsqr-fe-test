import { Skeleton, SkeletonGroup } from '@/components/ui'
import styles from './UserDetailsSkeleton.module.scss'

/**
 * Fields per group in the General Details tab — personal information,
 * education and employment, socials, guarantor — which is the tab that
 * renders once the record arrives.
 */
const GROUP_SIZES = [8, 7, 3, 4]

const TAB_WIDTHS = ['96px', '76px', '84px', '48px', '58px', '104px']

interface UserDetailsSkeletonProps {
  /** Announced while the record loads; names the user when one was selected. */
  label: string
}

/**
 * Mirrors the loaded page: back link, title row with its two actions, the
 * profile card with its tab strip, then the details card. A placeholder that
 * does not match the layout it replaces reads as the page changing shape
 * rather than filling in.
 */
function UserDetailsSkeleton({ label }: UserDetailsSkeletonProps) {
  return (
    <SkeletonGroup label={label} className={styles.page}>
      <Skeleton width="110px" height="14px" />

      <div className={styles.header}>
        <Skeleton width="130px" height="24px" />
        <div className={styles.actions}>
          <Skeleton width="140px" height="34px" />
          <Skeleton width="130px" height="34px" />
        </div>
      </div>

      <div className={styles.profile}>
        <div className={styles.identity}>
          <Skeleton variant="circular" width="100px" height="100px" />

          <div className={styles.stack}>
            <Skeleton width="170px" height="20px" />
            <Skeleton width="110px" height="14px" />
          </div>

          <div className={styles.divider} />

          <div className={styles.stack}>
            <Skeleton width="80px" height="14px" />
            <Skeleton width="66px" height="16px" />
          </div>

          <div className={styles.divider} />

          <div className={styles.stack}>
            <Skeleton width="130px" height="20px" />
            <Skeleton width="170px" height="12px" />
          </div>
        </div>

        <div className={styles.tabs}>
          {TAB_WIDTHS.map((width) => (
            <Skeleton key={width} width={width} height="14px" />
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {GROUP_SIZES.map((size, group) => (
          <div key={group} className={styles.group}>
            <Skeleton width="180px" height="14px" />
            <div className={styles.grid}>
              {Array.from({ length: size }).map((_, field) => (
                <div key={field} className={styles.field}>
                  <Skeleton width="70%" height="10px" />
                  <Skeleton width="90%" height="14px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SkeletonGroup>
  )
}

export default UserDetailsSkeleton
