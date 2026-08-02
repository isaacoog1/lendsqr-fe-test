import { Skeleton } from '@/components/ui'
// Deliberately the table's own stylesheet: the placeholder is only useful if
// it lands in the same box — same card, same cell padding, same row height —
// as the table that replaces it.
import styles from './UsersTable.module.scss'

/**
 * Relative widths of the six data columns. Uneven on purpose: rows of equal
 * bars read as a loading bar rather than as a table about to arrive.
 */
const CELL_WIDTHS = ['70%', '55%', '85%', '60%', '75%', '45%']

interface UsersTableSkeletonProps {
  /** Match the page size so the swap to real rows does not jump. */
  rows?: number
}

function UsersTableSkeleton({ rows = 10 }: UsersTableSkeletonProps) {
  return (
    // The wrapping SkeletonGroup announces the wait; this structure is
    // decoration, and an empty table would only clutter what it announces.
    <div className={styles.container} aria-hidden="true">
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {CELL_WIDTHS.map((width, column) => (
                <th key={column} className={styles.th}>
                  <Skeleton width={width} height="10px" />
                </th>
              ))}
              <th className={styles.th} />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row}>
                {CELL_WIDTHS.map((width, column) => (
                  <td key={column} className={styles.td}>
                    <Skeleton width={width} height="12px" />
                  </td>
                ))}
                <td className={styles.td}>
                  <Skeleton width="4px" height="14px" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.skeletonPagination}>
        <Skeleton width="160px" height="14px" />
        <Skeleton width="200px" height="28px" />
      </div>
    </div>
  )
}

export default UsersTableSkeleton
