/**
 * PageContainer - Consistent wrapper for all dashboard page content
 * Enforces max-width, padding, spacing across all pages
 */
const PageContainer = ({ children, className = '' }) => (
  <div className={`ds-page-container ${className}`.trim()}>
    {children}
  </div>
)

export default PageContainer
