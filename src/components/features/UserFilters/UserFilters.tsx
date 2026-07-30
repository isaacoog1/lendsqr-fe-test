import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, Select, Button } from '@/components/ui'
import {
  filterSchema,
  EMPTY_FILTERS,
  type FilterFormData,
} from './filterSchema'
import styles from './UserFilters.module.scss'

interface UserFiltersProps {
  organizations: string[]
  onApply: (filters: FilterFormData) => void
  onReset: () => void
  isOpen: boolean
  onClose: () => void
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'blacklisted', label: 'Blacklisted' },
]

function UserFilters({
  organizations,
  onApply,
  onReset,
  isOpen,
  onClose,
}: UserFiltersProps) {
  const { register, handleSubmit, reset } = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: EMPTY_FILTERS,
  })

  const organizationOptions = organizations.map((org) => ({
    value: org,
    label: org,
  }))

  const handleReset = () => {
    reset(EMPTY_FILTERS)
    onReset()
  }

  const onSubmit = (data: FilterFormData) => {
    onApply(data)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Select
          label="Organization"
          options={organizationOptions}
          placeholder="Select"
          {...register('organization')}
        />

        <Input label="Username" placeholder="User" {...register('username')} />

        <Input label="Email" placeholder="Email" {...register('email')} />

        <Input
          label="Date"
          type="date"
          placeholder="Date"
          {...register('dateJoined')}
        />

        <Input
          label="Phone Number"
          placeholder="Phone Number"
          {...register('phoneNumber')}
        />

        <Select
          label="Status"
          options={STATUS_OPTIONS}
          placeholder="Select"
          {...register('status')}
        />

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit">Filter</Button>
        </div>
      </form>
    </div>
  )
}

export default UserFilters
