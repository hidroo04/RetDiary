import React from 'react';
import styles from './GlassCard.module.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className = '' }: GlassCardProps) => {
  return (
    <div className={`${styles.glassCard} ${className}`}>
      {children}
    </div>
  );
};
