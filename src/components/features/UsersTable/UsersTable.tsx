import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { MoreVertical, Eye, UserX, UserCheck, UserMinus, ListFilter } from 'lucide-react'
import type { UserStatus } from '@/types'
import { useNavigate } from 'react-router-dom'
import type { User } from '@/types'
import { formatDate, saveSelectedUser } from '@/utils'
import { Badge, Dropdown, Pagination } from '@/components/ui'
import styles from './UsersTable.module.scss'

function getActionsForStatus(status: UserStatus, onViewDetails: () => void) {
  const viewDetails = {
    label: 'View Details',
    icon: <Eye size={14} />,
    onClick: onViewDetails,
  }

  switch (status) {
    case 'active':
      return [
        viewDetails,
        { label: 'Blacklist User', icon: <UserX size={14} />, onClick: () => {} },
        { label: 'Deactivate User', icon: <UserMinus size={14} />, onClick: () => {} },
      ]
    case 'inactive':
      return [
        viewDetails,
        { label: 'Activate User', icon: <UserCheck size={14} />, onClick: () => {} },
        { label: 'Blacklist User', icon: <UserX size={14} />, onClick: () => {} },
      ]
    case 'pending':
      return [
        viewDetails,
        { label: 'Activate User', icon: <UserCheck size={14} />, onClick: () => {} },
        { label: 'Blacklist User', icon: <UserX size={14} />, onClick: () => {} },
      ]
    case 'blacklisted':
      return [
        viewDetails,
        { label: 'Activate User', icon: <UserCheck size={14} />, onClick: () => {} },
      ]
  }
}

interface UsersTableProps {
  data: User[]
  onFilterClick?: () => void
}

function UsersTable({ data, onFilterClick }: UsersTableProps) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<User, string>[] = [
    {
      accessorKey: 'organization',
      header: 'ORGANIZATION',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'username',
      header: 'USERNAME',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'email',
      header: 'EMAIL',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'phoneNumber',
      header: 'PHONE NUMBER',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'dateJoined',
      header: 'DATE JOINED',
      cell: (info) => formatDate(info.getValue()),
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: (info) => <Badge status={info.getValue() as User['status']} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const user = row.original
        return (
          <Dropdown
            trigger={<MoreVertical size={16} />}
            items={getActionsForStatus(user.status, () => {
              saveSelectedUser(user)
              navigate(`/users/${user.id}`)
            })}
          />
        )
      },
      enableSorting: false,
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={styles.th}>
                    <span className={styles.headerContent}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.id !== 'actions' && (
                        <button
                          type="button"
                          className={styles.filterIcon}
                          onClick={(e) => {
                            e.stopPropagation()
                            onFilterClick?.()
                          }}
                          aria-label={`Filter by ${header.column.columnDef.header}`}
                        >
                          <ListFilter size={12} />
                        </button>
                      )}
                    </span>
                  </th>
                ))}
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
                        ? (e) => e.stopPropagation()
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

      <Pagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        pageSize={table.getState().pagination.pageSize}
        totalItems={table.getFilteredRowModel().rows.length}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onPageSizeChange={(size) => table.setPageSize(size)}
      />
    </div>
  )
}

export default UsersTable
export { type UsersTableProps }
