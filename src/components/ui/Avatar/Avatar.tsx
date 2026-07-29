import { cn } from '@/utils'
import styles from './Avatar.module.scss'

interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(styles.avatar, styles[size], className)}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} className={styles.image} />
      ) : (
        <span className={styles.initials}>{getInitials(name)}</span>
      )}
    </div>
  )
}

export default Avatar
