import { Outlet } from 'react-router-dom'
import styles from './AuthLayout.module.scss'

function AuthLayout() {
  return (
    <div className={styles.layout}>
      <div className={styles.left}>
        <div className={styles.logoWrapper}>
          <img src="/logo.svg" alt="Lendsqr" className={styles.logo} />
        </div>
        <div className={styles.illustration}>
          <img
            src="/auth-illustration.svg"
            alt=""
            className={styles.illustrationImage}
          />
        </div>
      </div>
      <div className={styles.right}>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
