import { type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Menu, Search, ChevronDown } from 'lucide-react'
import { Avatar } from '@/components/ui'
import styles from './Header.module.scss'

interface HeaderProps {
  onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeQuery = searchParams.get('q') ?? ''

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = String(
      new FormData(event.currentTarget).get('q') ?? '',
    ).trim()
    navigate(query ? `/users?q=${encodeURIComponent(query)}` : '/users')
  }

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
      </div>

      {/*
        A sibling of the logo and profile groups rather than a child of either,
        so that below the tablet breakpoint it can wrap onto a row of its own
        without pulling them along.
      */}
      <form
        className={styles.searchWrapper}
        role="search"
        onSubmit={handleSubmit}
      >
        {/*
          Uncontrolled, keyed on the active query: the header outlives the
          pages below it, so remounting is what resyncs the field when the
          query is cleared from the users page or a nav link is followed.
        */}
        <input
          key={activeQuery}
          name="q"
          type="search"
          placeholder="Search for anything"
          className={styles.searchInput}
          defaultValue={activeQuery}
          aria-label="Search users"
        />
        <button
          type="submit"
          className={styles.searchButton}
          aria-label="Search"
        >
          <Search size={14} />
        </button>
      </form>

      <div className={styles.right}>
        <a href="https://docs.lendsqr.com" className={styles.docsLink} target="_blank" rel="noopener noreferrer">
          Docs
        </a>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className={styles.profile}>
          <Avatar name="Oluwakorede" size="sm" />
          <span className={styles.profileName}>Oluwakorede</span>
          <ChevronDown size={14} className={styles.profileChevron} />
        </div>
      </div>
    </header>
  )
}

export default Header
