import Community from '@/pages/public/Community'

/**
 * OrgCommunity - Community access for organization role
 * Passes role='organization' to enable organization-specific features
 */
const OrgCommunity = () => {
  return <Community role="organization" />
}

export default OrgCommunity
