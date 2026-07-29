import { Star } from 'lucide-react'
import styles from './TierStars.module.scss'

interface TierStarsProps {
  tier: number
  maxTier?: number
}

function TierStars({ tier, maxTier = 3 }: TierStarsProps) {
  return (
    <div className={styles.container} aria-label={`Tier ${tier} of ${maxTier}`}>
      {Array.from({ length: maxTier }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < tier ? styles.filled : styles.empty}
          fill={i < tier ? '#E9B200' : 'none'}
        />
      ))}
    </div>
  )
}

export default TierStars
