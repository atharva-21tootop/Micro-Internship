import './SaaSPrimitives.css'

export const PageShell = ({ eyebrow, title, description, actions, children }) => (
  <section className="ui-page">
    {(title || description || actions) && (
      <div className="ui-page-header">
        <div>
          {eyebrow && <span className="ui-eyebrow">{eyebrow}</span>}
          {title && <h1>{title}</h1>}
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="ui-page-actions">{actions}</div>}
      </div>
    )}
    {children}
  </section>
)

export const StatCard = ({ icon: Icon, label, value, tone = 'indigo', helper }) => (
  <article className="ui-stat-card">
    {Icon && (
      <span className={`ui-stat-icon tone-${tone}`}>
        <Icon size={20} />
      </span>
    )}
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
      {helper && <small>{helper}</small>}
    </div>
  </article>
)

export const StatsCard = StatCard

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="ui-empty-state">
    {Icon && (
      <span className="ui-empty-icon">
        <Icon size={26} />
      </span>
    )}
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {action}
  </div>
)

export const SkeletonBlock = ({ rows = 3 }) => (
  <div className="ui-skeleton-card" aria-label="Loading">
    {Array.from({ length: rows }).map((_, index) => (
      <span key={index} className="ui-skeleton-line" />
    ))}
  </div>
)
