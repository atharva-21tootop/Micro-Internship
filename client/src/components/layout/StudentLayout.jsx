import SaaSLayout from './SaaSLayout'
import { getDashboardConfig } from '@/config/dashboardConfig'

/**
 * StudentLayout - Student dashboard layout with sidebar
 * Uses centralized configuration for consistency
 */
const StudentLayout = () => {
  const config = getDashboardConfig('student')

  return (
    <SaaSLayout
      sidebarLinks={config.sidebarLinks}
      homePath={config.home}
      profilePath={config.profile}
      workspaceLabel={config.workspaceLabel}
      sidebarHelper={config.sidebarHelper}
    />
  )
}

export default StudentLayout
