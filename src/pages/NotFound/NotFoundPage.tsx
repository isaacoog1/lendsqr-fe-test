import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.scss'

function NotFoundPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Page not found</p>
      <Link to="/dashboard" className={styles.link}>
        Go to Dashboard
      </Link>
    </div>
  )
}

export default NotFoundPage
