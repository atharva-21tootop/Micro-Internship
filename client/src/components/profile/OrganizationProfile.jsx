import { useEffect, useState } from 'react'
import { Building2, Briefcase, Users, MapPin } from 'lucide-react'
import { subscribeToInternships } from '@/services/internshipService'
import { subscribeToApplicationsByOrg } from '@/services/applicationService'
import StatusBadge from '@/components/common/StatusBadge'
import { formatDate } from '@/utils/formatDate'

const OrganizationProfile = ({ user, userData }) => {
  const [postedInternships, setPostedInternships] = useState([])
  const [applicants, setApplicants] = useState([])

  useEffect(() => {
    if (!user?.uid) return undefined

    const unsubInternships = subscribeToInternships((list) => {
      setPostedInternships((list || []).filter((i) => i.orgId === user.uid))
    })

    const unsubApps = subscribeToApplicationsByOrg(user.uid, setApplicants)

    return () => {
      unsubInternships()
      unsubApps()
    }
  }, [user?.uid])

  return (
    <div className="role-profile org-profile">
      <h3>Company Details</h3>
      <div className="info-grid">
        <div className="info-group">
          <label className="info-label"><Building2 size={18} /> Company</label>
          <span className="info-value">{userData?.companyName || userData?.fullName || 'Not set'}</span>
        </div>
        <div className="info-group">
          <label className="info-label"><MapPin size={18} /> Location</label>
          <span className="info-value">{userData?.location || userData?.address || 'Not set'}</span>
        </div>
        <div className="info-group full-width">
          <label className="info-label">About</label>
          <span className="info-value">{userData?.bio || userData?.description || 'No description'}</span>
        </div>
      </div>

      <h3><Briefcase size={18} /> Posted Internships ({postedInternships.length})</h3>
      {postedInternships.length === 0 ? (
        <p className="info-value">No internships posted yet.</p>
      ) : (
        <div className="org-internships-list">
          {postedInternships.map((intern) => (
            <div key={intern.id} className="org-list-card">
              <h4>{intern.title}</h4>
              <p>{intern.company}</p>
              <StatusBadge status={intern.approved === false ? 'Pending' : 'Active'} />
            </div>
          ))}
        </div>
      )}

      <h3><Users size={18} /> Applicants ({applicants.length})</h3>
      {applicants.length === 0 ? (
        <p className="info-value">No applicants yet.</p>
      ) : (
        <div className="org-applicants-list">
          {applicants.slice(0, 20).map((app) => (
            <div key={app.id} className="org-list-card">
              <h4>{app.studentName || app.studentEmail || 'Applicant'}</h4>
              <p>{app.title} · {app.company}</p>
              <div className="org-app-meta">
                <StatusBadge status={app.status || 'Pending'} />
                <span>{formatDate(app.appliedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrganizationProfile
