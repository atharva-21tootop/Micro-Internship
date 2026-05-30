import SaaSLayout from './SaaSLayout'
import { getDashboardConfig } from '@/config/dashboardConfig'

/**
 * OrgLayout - Organization dashboard layout with sidebar
 * Uses centralized configuration for consistency
 */
const OrgLayout = () => {
  const config = getDashboardConfig('organization')

  return (
    <SaaSLayout
      sidebarLinks={config.sidebarLinks}
      homePath={config.home}
      profilePath={config.profile}
      workspaceLabel={config.workspaceLabel}
      sidebarHelper={config.sidebarHelper}
      topLinks={config.topLinks}
    />
  )
}

export default OrgLayout
