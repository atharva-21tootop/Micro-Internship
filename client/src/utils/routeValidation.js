/** * Route validation utilities — validates sidebar links match route config
 * Simplified to only validate sidebar links (the source of truth for navigation)
 */

import { DASHBOARD_CONFIGS, VALID_ROLES } from '@/config/dashboardConfig'

/**
 * Validate that all sidebar links have valid structure and match their role route prefix
 */
export const validateSidebarLinksConsistency = () => {
  const report = {
    valid: true,
    errors: [],
    warnings: [],
    summary: {},
  }

  VALID_ROLES.forEach((role) => {
    const config = DASHBOARD_CONFIGS[role]
    const links = config?.sidebarLinks || []
    const routeRoot = config?.route

    const linkPaths = new Set()

    links.forEach((link, index) => {
      // Check structure
      if (!link.to || !link.label || !link.icon) {
        report.valid = false
        report.errors.push(
          `[${role}] Link ${index} missing required fields: ${JSON.stringify(link)}`
        )
      }

      // Check route prefix
      if (link.to && !link.to.startsWith(routeRoot)) {
        report.valid = false
        report.errors.push(
          `[${role}] Link "${link.label}" (${link.to}) doesn't start with role route (${routeRoot})`
        )
      }

      // Check duplicates
      if (linkPaths.has(link.to)) {
        report.valid = false
        report.errors.push(`[${role}] Duplicate link path: ${link.to}`)
      }
      linkPaths.add(link.to)
    })

    report.summary[role] = {
      links: links.length,
      routeRoot,
      paths: Array.from(linkPaths),
    }
  })

  return report
}

/**
 * Run full validation suite
 * Returns comprehensive report of dashboard route health
 */
export const validateAllRoutes = () => {
  const linkReport = validateSidebarLinksConsistency()

  const fullReport = {
    valid: linkReport.valid,
    timestamp: new Date().toISOString(),
    linkValidation: linkReport,
  }

  // Log validation results in development
  if (process.env.NODE_ENV === 'development') {
    if (!fullReport.valid) {
      console.error('❌ Route validation failed:', fullReport)
    } else {
      console.log('✅ All routes validated successfully')
    }
  }

  return fullReport
}
