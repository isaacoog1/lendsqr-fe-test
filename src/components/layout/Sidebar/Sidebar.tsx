import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, X, LogOut } from 'lucide-react'
import { cn } from '@/utils'
import { useAuth } from '@/contexts/useAuth'
import {
  sidebarConfig,
  dashboardItem,
  switchOrgItem,
} from '@/config/sidebar'
import styles from './Sidebar.module.scss'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const SwitchIcon = switchOrgItem.icon
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      <aside className={cn(styles.sidebar, isOpen && styles.open)}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        <div className={styles.switchOrg}>
          <SwitchIcon size={16} />
          <span>{switchOrgItem.label}</span>
          <ChevronDown size={14} />
        </div>

        <nav className={styles.nav}>
          <NavLink
            to={dashboardItem.path}
            className={({ isActive }) =>
              cn(styles.navItem, isActive && styles.active)
            }
            onClick={onClose}
          >
            <dashboardItem.icon size={16} />
            <span>{dashboardItem.label}</span>
          </NavLink>

          {sidebarConfig.map((group) => (
            <div key={group.title} className={styles.group}>
              <span className={styles.groupTitle}>{group.title}</span>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(styles.navItem, isActive && styles.active)
                  }
                  onClick={onClose}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
          <span className={styles.version}>v1.2.0</span>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
