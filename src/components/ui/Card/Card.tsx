import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils'
import styles from './Card.module.scss'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

function Card({ children, padding = 'md', className, ...props }: CardProps) {
  return (
    <div className={cn(styles.card, styles[padding], className)} {...props}>
      {children}
    </div>
  )
}

export default Card
