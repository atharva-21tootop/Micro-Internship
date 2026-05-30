import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import OrganizationProfile from '@/components/profile/OrganizationProfile'
import { useProfile } from '@/hooks/useProfile'

const OrganizationProfilePage = () => {
  const { user, userData, loading } = useProfile()

  if (loading) {
    return <div className="profile-page"><div className="container"><p>Loading profile…</p></div></div>
  }

  if (!userData) {
    return <div className="profile-page"><div className="container"><p>Profile not found</p></div></div>
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>Organization Profile</h1>
          <Link to={ROUTES.organization.overview} className="saas-btn saas-btn-outline">← Back to Dashboard</Link>
        </div>
        <div className="tab-content portfolio-card">
          <OrganizationProfile user={user} userData={userData} />
        </div>
      </div>
    </div>
  )
}

export default OrganizationProfilePage
