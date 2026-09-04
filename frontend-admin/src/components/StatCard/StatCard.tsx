import React from 'react'
import styles from './StatCard.module.css'

interface StatCardProps {
  title: string
  value: number | string
  badge?: string
  icon?: React.ReactNode
  colorTheme?: 'pink' | 'lavender'
  className?: string
}

export const StatCard = ({
  title,
  value,
  badge,
  icon,
  colorTheme = 'pink',
  className = '',
}: StatCardProps) => {
  return (
    <div className={`${styles.statCard} ${className}`}>
      {icon && <div className={`${styles.iconBox} ${styles[colorTheme]}`}>{icon}</div>}
      <div className={styles.infoContainer}>
        <span className={`${styles.title} ${styles[`text-${colorTheme}`]}`}>{title}</span>
        <div className={styles.content}>
          <span className={styles.value}>{value}</span>
          {badge && (
            <span className={`${styles.badge} ${styles[`badge-${colorTheme}`]}`}>{badge}</span>
          )}
        </div>
      </div>
    </div>
  )
}
