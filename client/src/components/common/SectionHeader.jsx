/**
 * SectionHeader - Consistent section header with title, subtitle, badge, and action slot
 * Replaces inconsistent .section-header, .content-header, .utils-header across pages
 */
const SectionHeader = ({ title, subtitle, badge, actions, children, className = '' }) => (
  <div className={`ds-section-header ${className}`.trim()}>
    <div className="ds-section-header-text">
      <div className="ds-section-header-title-row">
        <h2>{title}</h2>
        {badge && <span className="ds-section-badge">{badge}</span>}
      </div>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {(actions || children) && (
      <div className="ds-section-header-actions">
        {actions || children}
      </div>
    )}
  </div>
)

export default SectionHeader
