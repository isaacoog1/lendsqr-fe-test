import styles from './InfoGrid.module.scss'

interface InfoItem {
  label: string
  value: string | undefined | null
}

interface InfoGridProps {
  items: InfoItem[]
}

function InfoGrid({ items }: InfoGridProps) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.value}>{item.value || '—'}</span>
        </div>
      ))}
    </div>
  )
}

export default InfoGrid
