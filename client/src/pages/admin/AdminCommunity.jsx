import Community from '@/pages/public/Community'

/**
 * AdminCommunity - Community access for admin role
 * Passes role='admin' to enable admin-specific features
 */
const AdminCommunity = () => {
  return <Community role="admin" />
}

export default AdminCommunity
