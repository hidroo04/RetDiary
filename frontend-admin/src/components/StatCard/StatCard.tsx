import React from 'react';
import { GlassCard } from '../GlassCard/GlassCard';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: number | string;
  badge?: string;
  className?: string;
}

export const StatCard = ({ title, value, badge, className = '' }: StatCardProps) => {
  return (
    <GlassCard className={`${styles.statCard} ${className}`}>
      <span className={styles.title}>{title}</span>
      <div className={styles.content}>
        <span className={styles.value}>{value}</span>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>
    </GlassCard>
  );
};
