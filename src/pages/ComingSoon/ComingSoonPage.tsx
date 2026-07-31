import { Link, useLocation } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { sidebarConfig } from '@/config/sidebar'
import styles from './ComingSoonPage.module.scss'

/** Title-cases the trailing path segment: /loan-requests -> "Loan Requests". */
function titleFromPath(pathname: string): string {
  const match = sidebarConfig
    .flatMap((group) => group.items)
    .find((item) => item.path === pathname)

  return match?.label ?? 'This page'
}

/**
 * Rendered for navigation items the sidebar advertises but this assessment
 * does not implement. It sits inside the app layout so the header and sidebar
 * survive — a bare 404 would strip the shell and leave no way back.
 */
function ComingSoonPage() {
  const { pathname } = useLocation()

  return (
    <div className={styles.container}>
      <span className={styles.icon} aria-hidden="true">
        <Construction size={28} />
      </span>
      <h1 className={styles.title}>{titleFromPath(pathname)}</h1>
      <p className={styles.message}>
        This section is not part of the assessment scope. The Users module shows
        the patterns the rest of the console would follow.
      </p>
      <Link to="/users" className={styles.link}>
        Go to Users
      </Link>
    </div>
  )
}

export default ComingSoonPage
