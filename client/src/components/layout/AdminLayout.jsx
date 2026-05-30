import SaaSLayout from './SaaSLayout'
import { getDashboardConfig } from '@/config/dashboardConfig'

/**
 * AdminLayout - Admin dashboard layout with sidebar
 * Uses centralized configuration for consistency
 */
const AdminLayout = () => {
  const config = getDashboardConfig('admin')

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

export default AdminLayout
