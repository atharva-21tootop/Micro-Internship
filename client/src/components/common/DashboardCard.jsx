/**
 * DashboardCard - Unified card component for all dashboard pages
 * Consistent styling: white bg, 16px border-radius, standard shadow, 20px padding
 * 
 * @param {string} className - Additional CSS classes
 * @param {string} variant - 'default' | 'danger' | 'highlight' | 'flat'
 * @param {boolean} hoverable - Enable hover lift effect (default: true)
 * @param {React.ReactNode} children - Card content
 */
const DashboardCard = ({ children, className = '', variant = 'default', hoverable = true }) => (
  <div className={`ds-card ds-card-${variant} ${hoverable ? 'ds-card-hoverable' : ''} ${className}`.trim()}>
    {children}
  </div>
)

export default DashboardCard
