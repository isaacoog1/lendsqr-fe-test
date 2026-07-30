import type { LucideIcon } from 'lucide-react'
import styles from './StatCard.module.scss'

interface StatCardProps {
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  label: string
  value: string | number
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  label,
  value,
}: StatCardProps) {
  return (
    <div className={styles.card}>
      <div
        className={styles.iconWrapper}
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon size={22} color={iconColor} />
      </div>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  )
}

export default StatCard
