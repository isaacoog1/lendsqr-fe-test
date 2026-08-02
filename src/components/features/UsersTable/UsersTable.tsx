import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table'
import {
  MoreVertical,
  Eye,
  UserX,
  UserCheck,
  UserMinus,
  ListFilter,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type {
  Pagination as PaginationState,
  SortOrder,
  UserSortField,
  UserStatus,
  UserSummary,
} from '@/types'
import { cn, formatDate, saveSelectedUser } from '@/utils'
import { USER_SORT_FIELDS } from '@/constants'
import {
  Badge,
  Dropdown,
  EmptyState,
  Pagination,
  Spinner,
} from '@/components/ui'
import {
  UserFilters,
  type FilterFormData,
} from '@/components/features/UserFilters'
import styles from './UsersTable.module.scss'

export interface SortState {
  sortBy?: UserSortField
  sortOrder?: SortOrder
}

function getActionsForStatus(status: UserStatus, onViewDetails: () => void) {
  const viewDetails = {
    label: 'View Details',
    icon: <Eye size={14} />,
    onClick: onViewDetails,
  }
  const blacklist = {
    label: 'Blacklist User',
    icon: <UserX size={14} />,
    onClick: () => {},
  }
  const activate = {
    label: 'Activate User',
    icon: <UserCheck size={14} />,
    onClick: () => {},
  }

  switch (status) {
    case 'active':
      return [
        viewDetails,
        blacklist,
        {
          label: 'Deactivate User',
          icon: <UserMinus size={14} />,
          onClick: () => {},
        },
      ]
    case 'inactive':
    case 'pending':
      return [viewDetails, activate, blacklist]
    case 'blacklisted':
      return [viewDetails, activate]
  }
}

const columnHelper = createColumnHelper<UserSummary>()

interface FilterConfig {
  organizations: string[]
  /** What is applied, so reopening the panel shows it. */
  values: FilterFormData
  isActive: boolean
  onApply: (filters: FilterFormData) => void
  onReset: () => void
}

interface UsersTableProps {
  data: UserSummary[]
  /** Page metadata from the server — the table does not slice rows itself. */
  pagination: PaginationState
  sort: SortState
  onSortChange: (sort: SortState) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  /** Omit to render the table without the header filter affordance. */
  filters?: FilterConfig
  /**
   * A new page or query is in flight while the previous rows are still shown.
   * Masks the table so nobody clicks a row that is about to be replaced.
   */
  isFetching?: boolean
  /** Shown under the column headers when the server returned no rows. */
  emptyState?: ReactNode
}

function UsersTable({
  data,
  pagination,
  sort,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  filters,
  isFetching = false,
  emptyState,
}: UsersTableProps) {
  const navigate = useNavigate()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterPanelRef = useRef<HTMLDivElement>(null)

  /**
   * Dismiss the panel on a click anywhere else on the page, or on Escape.
   * The column headers' filter buttons are exempt: they toggle, so closing on
   * their mousedown would leave the following click reopening what it closed.
   */
  useEffect(() => {
    if (!filtersOpen) return

    function handleMouseDown(event: MouseEvent) {
      const target = event.target

      if (!(target instanceof Element)) return
      if (filterPanelRef.current?.contains(target)) return
      if (target.closest(`.${styles.filterIcon}`)) return

      setFiltersOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setFiltersOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [filtersOpen])

  // The API describes sorting as two scalars; TanStack Table wants a list.
  // Translating at this boundary keeps the table's shape out of the URL.
  const sorting: SortingState = sort.sortBy
    ? [{ id: sort.sortBy, desc: sort.sortOrder === 'desc' }]
    : []

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater
    const [column] = next

    if (!column) {
      onSortChange({})
      return
    }

    // Column ids and the API's sortable fields happen to be the same strings,
    // but only the six accessor columns are sortable — matching against the
    // service's list turns that coincidence into something TypeScript checks.
    const sortBy = USER_SORT_FIELDS.find((field) => field === column.id)

    onSortChange(
      sortBy ? { sortBy, sortOrder: column.desc ? 'desc' : 'asc' } : {},
    )
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('organization', { header: 'ORGANIZATION' }),
      columnHelper.accessor('username', {
        header: 'USERNAME',
        cell: (info) => (
          <Link
            to={`/users/${info.row.original.id}`}
            className={styles.userLink}
            onClick={(event) => {
              event.stopPropagation()
              saveSelectedUser(info.row.original)
            }}
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor('email', { header: 'EMAIL' }),
      columnHelper.accessor('phoneNumber', { header: 'PHONE NUMBER' }),
      columnHelper.accessor('dateJoined', {
        header: 'DATE JOINED',
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor('status', {
        header: 'STATUS',
        cell: (info) => <Badge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const user = row.original
          return (
            <Dropdown
              trigger={<MoreVertical size={16} />}
              triggerLabel={`Actions for ${user.username}`}
              items={getActionsForStatus(user.status, () => {
                saveSelectedUser(user)
                navigate(`/users/${user.id}`)
              })}
            />
          )
        },
      }),
    ],
    [navigate],
  )

  // TanStack Table returns fresh function identities on every call, so the
  // React Compiler declines to memoize this component. That is correct and
  // unavoidable here — the table owns its own memoization internally, and the
  // expensive input (`columns`) is memoized above.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.perPage,
      },
    },
    onSortingChange: handleSortingChange,
    // The server has already sorted and sliced. Row models that do it again
    // would reorder the current page against itself.
    manualSorting: true,
    manualPagination: true,
    pageCount: pagination.totalPages,
    rowCount: pagination.total,
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows

  return (
    <div className={styles.container}>
      {/*
        The mask is a sibling of the scroll container rather than a child of
        it: inside, an absolutely positioned element is laid out against the
        scrolled content, so it would slide away as soon as the table is
        scrolled sideways.
      */}
      <div className={styles.tableArea} aria-busy={isFetching}>
        <div className={cn(styles.tableContent, isFetching && styles.busy)}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const label = String(header.column.columnDef.header)
                      const sortDirection = header.column.getIsSorted()

                      return (
                        <th
                          key={header.id}
                          scope="col"
                          className={styles.th}
                          aria-sort={
                            sortDirection === 'asc'
                              ? 'ascending'
                              : sortDirection === 'desc'
                                ? 'descending'
                                : 'none'
                          }
                        >
                          <span className={styles.headerContent}>
                            {header.column.getCanSort() ? (
                              <button
                                type="button"
                                className={styles.sortButton}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                                {sortDirection === 'asc' && (
                                  <ChevronUp size={12} aria-hidden="true" />
                                )}
                                {sortDirection === 'desc' && (
                                  <ChevronDown size={12} aria-hidden="true" />
                                )}
                              </button>
                            ) : (
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )
                            )}

                            {filters && header.column.getCanSort() && (
                              <button
                                type="button"
                                className={cn(
                                  styles.filterIcon,
                                  filters.isActive && styles.filterIconActive,
                                )}
                                onClick={() => setFiltersOpen((open) => !open)}
                                aria-label={
                                  filters.isActive
                                    ? `Filter by ${label} (filters active)`
                                    : `Filter by ${label}`
                                }
                                aria-expanded={filtersOpen}
                              >
                                <ListFilter size={12} />
                              </button>
                            )}
                          </span>
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={styles.tr}
                    onClick={() => {
                      const user = row.original
                      saveSelectedUser(user)
                      navigate(`/users/${user.id}`)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={styles.td}
                        onClick={
                          cell.column.id === 'actions'
                            ? (event) => event.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/*
            A query that matched nothing keeps the headers — and with them the
            filter affordance that produced the empty result. The message sits
            outside the horizontal scroller rather than in a spanning cell: a
            cell would be as wide as the table's 800px minimum and scroll out
            of sight on a phone.
          */}
          {rows.length === 0 && (
            <div className={styles.empty}>
              {emptyState ?? (
                <EmptyState
                  title="No users found"
                  description="There are no users to display at this time."
                />
              )}
            </div>
          )}
        </div>

        {isFetching && (
          <div className={styles.loadingMask}>
            <span className={styles.loadingIndicator}>
              <Spinner />
            </span>
          </div>
        )}
      </div>

      {/*
        Anchored below the header row rather than inside the <th>, because the
        table scrolls horizontally and an absolutely positioned panel inside the
        scroll container would be clipped.
      */}
      {filters && filtersOpen && (
        <div className={styles.filterAnchor} ref={filterPanelRef}>
          <UserFilters
            organizations={filters.organizations}
            values={filters.values}
            isOpen
            onClose={() => setFiltersOpen(false)}
            onApply={filters.onApply}
            onReset={filters.onReset}
          />
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        pageSize={pagination.perPage}
        totalItems={pagination.total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}

export default UsersTable
export { type UsersTableProps }
