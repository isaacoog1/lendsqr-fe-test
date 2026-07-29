import { Bell, Menu, Search, ChevronDown } from 'lucide-react'
import { Avatar } from '@/components/ui'
import styles from './Header.module.scss'

interface HeaderProps {
  onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <div className={styles.logo}>
          <img src="/logo.svg" alt="Lendsqr" className={styles.logoImage} />
        </div>

        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search for anything"
            className={styles.searchInput}
            aria-label="Search"
          />
          <button className={styles.searchButton} aria-label="Submit search">
            <Search size={14} />
          </button>
        </div>
      </div>

      <div className={styles.right}>
        <a href="#" className={styles.docsLink}>
          Docs
        </a>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className={styles.profile}>
          <Avatar name="Adedeji" size="sm" />
          <span className={styles.profileName}>Adedeji</span>
          <ChevronDown size={14} className={styles.profileChevron} />
        </div>
      </div>
    </header>
  )
}

export default Header
