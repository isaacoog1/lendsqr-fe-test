import { cn } from '@/utils'
import styles from './Tabs.module.scss'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
  className?: string
}

function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn(styles.container, className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={tab.key === activeTab}
          className={cn(styles.tab, tab.key === activeTab && styles.active)}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default Tabs
