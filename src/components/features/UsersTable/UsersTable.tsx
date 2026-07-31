import { useMemo, useState } from 'react'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
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
import type { User, UserStatus } from '@/types'
import { cn, formatDate, saveSelectedUser } from '@/utils'
import { Badge, Dropdown, Pagination } from '@/components/ui'
import {
  UserFilters,
  type FilterFormData,
} from '@/components/features/UserFilters'
import styles from './UsersTable.module.scss'

const PAGE_SIZE = 20

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

const columnHelper = createColumnHelper<User>()

interface FilterConfig {
  organizations: string[]
  isActive: boolean
  onApply: (filters: FilterFormData) => void
  onReset: () => void
}

interface UsersTableProps {
  data: User[]
  /** Omit to render the table without the header filter affordance. */
  filters?: FilterConfig
}

function UsersTable({ data, filters }: UsersTableProps) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

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
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  })

  return (
    <div className={styles.container}>
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
            {table.getRowModel().rows.map((row) => (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*
        Anchored below the header row rather than inside the <th>, because the
        table scrolls horizontally and an absolutely positioned panel inside the
        scroll container would be clipped.
      */}
      {filters && filtersOpen && (
        <div className={styles.filterAnchor}>
          <UserFilters
            organizations={filters.organizations}
            isOpen
            onClose={() => setFiltersOpen(false)}
            onApply={filters.onApply}
            onReset={filters.onReset}
          />
        </div>
      )}

      <Pagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        pageSize={table.getState().pagination.pageSize}
        totalItems={table.getPrePaginationRowModel().rows.length}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onPageSizeChange={(size) => table.setPageSize(size)}
      />
    </div>
  )
}

export default UsersTable
export { type UsersTableProps }
