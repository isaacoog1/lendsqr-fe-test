import { Link } from 'react-router-dom'
import { Construction } from 'lucide-react'
import styles from './ComingSoonPage.module.scss'

interface ComingSoonPageProps {
  /** The sidebar label for this destination, supplied by the route. */
  title: string
}

/**
 * Rendered for navigation items the sidebar advertises but this assessment
 * does not implement. It sits inside the app layout so the header and sidebar
 * survive — a bare 404 would strip the shell and leave no way back.
 *
 * Each of those items has its own route, so the label arrives as a prop rather
 * than being looked up from the path.
 */
function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className={styles.container}>
      <span className={styles.icon} aria-hidden="true">
        <Construction size={28} />
      </span>
      <h1 className={styles.title}>{title}</h1>
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
