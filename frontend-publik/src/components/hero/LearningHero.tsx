import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ParticleField } from '@/components/ParticleField'
import './LearningHero.css'

export function LearningHero({ eyebrow, title, description, image, backTo, backLabel, children }: { eyebrow: string; title: string; description?: string; image?: string; backTo?: string; backLabel?: string; children?: ReactNode }) {
  const style = image ? ({ '--learning-hero-image': `url("${image}")` } as CSSProperties) : undefined
  return <section className={`learning-hero ${image ? 'has-thumbnail' : 'fallback-hero'}`} style={style}>
    <div className="learning-hero-image" />
    <div className="learning-hero-shade" />
    {!image && <><ParticleField /><div className="learning-orbit orbit-a" /><div className="learning-orbit orbit-b" /></>}
    <div className="container learning-hero-content">
      {backTo && <Link to={backTo} className="hero-back-button"><span>←</span>{backLabel}</Link>}
      <span className="eyebrow light">{eyebrow}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children && <div className="learning-hero-meta">{children}</div>}
      <div className="courses-hero-divider" aria-hidden="true"><span /><i /><span /></div>
    </div>
  </section>
}
