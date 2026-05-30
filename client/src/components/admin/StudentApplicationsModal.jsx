import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, FileText, ExternalLink, Eye, AlertCircle } from 'lucide-react'
import { subscribeToApplicationsByStudent } from '@/services/applicationService'
import { formatDate } from '@/utils/formatDate'
import { ROUTES } from '@/config/routes'
import DashboardCard from '@/components/common/DashboardCard'
import { StatCard, SkeletonBlock } from '@/components/common/SaaSPrimitives'
import { toMatchPercent } from '@/utils/matchScore'
import './StudentApplicationsModal.css'

const normalizeStatus = (status) => {
  const s = (status || 'pending').toLowerCase()
  if (s === 'accepted' || s === 'approved') return 'Accepted'
  if (s === 'rejected') return 'Rejected'
  return 'Pending'
}

const statusClass = (status) => {
  const s = normalizeStatus(status).toLowerCase()
  return s
}

const StudentApplicationsModal = ({ student, onClose }) => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)

  useEffect(() => {
    if (!student?.id) return undefined

    setLoading(true)
    setError(null)

    const unsub = subscribeToApplicationsByStudent(student.id, (apps, err) => {
      if (err) {
        setError(err.message || 'Failed to load applications.')
        setApplications([])
      } else {
        setApplications(apps)
        setError(null)
      }
      setLoading(false)
    })

    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) setError('Unable to load applications. Check your connection.')
        return false
      })
    }, 12000)

    return () => {
      unsub()
      clearTimeout(timeout)
    }
  }, [student?.id])

  const stats = useMemo(() => {
    let accepted = 0
    let rejected = 0
    let pending = 0
    applications.forEach((app) => {
      const s = normalizeStatus(app.status)
      if (s === 'Accepted') accepted += 1
      else if (s === 'Rejected') rejected += 1
      else pending += 1
    })
    return {
      total: applications.length,
      accepted,
      rejected,
      pending,
    }
  }, [applications])

  if (!student) return null

  const skills = student.skills || []
  const department = student.department || student.branch || student.course || '—'

  return (
    <div className="student-apps-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="student-apps-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-apps-title"
      >
        <header className="student-apps-modal-header">
          <div>
            <span className="ui-eyebrow">Student applications</span>
            <h2 id="student-apps-title">{student.fullName || student.firstName || 'Student'}</h2>
            <p className="student-apps-sub">{student.email}</p>
          </div>
          <button type="button" className="saas-icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <DashboardCard hoverable={false} className="student-apps-profile">
          <div className="student-apps-profile-grid">
            <div>
              <span className="label">Department</span>
              <p>{department}</p>
            </div>
            <div>
              <span className="label">Skills</span>
              <div className="student-apps-skills">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span key={skill} className="ds-tag">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="muted">No skills listed</p>
                )}
              </div>
            </div>
          </div>
        </DashboardCard>

        <div className="student-apps-stats ds-grid ds-grid-stats">
          <StatCard icon={FileText} label="Total Applications" value={stats.total} tone="indigo" />
          <StatCard icon={FileText} label="Accepted" value={stats.accepted} tone="emerald" />
          <StatCard icon={FileText} label="Rejected" value={stats.rejected} tone="amber" />
          <StatCard icon={FileText} label="Pending" value={stats.pending} tone="sky" />
        </div>

        {loading && <SkeletonBlock rows={4} />}

        {error && !loading && (
          <div className="student-apps-error">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <DashboardCard hoverable={false} className="student-apps-empty">
            <FileText size={40} />
            <h3 className="ds-card-title">No applications yet</h3>
            <p className="ds-card-subtitle">This student has not applied to any internships.</p>
          </DashboardCard>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="student-apps-list">
            {applications.map((app) => {
              const match = toMatchPercent(app.matchScore ?? app.score)
              return (
                <DashboardCard key={app.id} className="student-app-row" hoverable={false}>
                  <div className="student-app-row-top">
                    <div>
                      <h3 className="ds-card-title">{app.title || 'Internship'}</h3>
                      <p className="ds-card-subtitle">{app.company || 'Organization'}</p>
                    </div>
                    <span className={`status-badge ${statusClass(app.status)}`}>
                      {normalizeStatus(app.status)}
                    </span>
                  </div>
                  <div className="student-app-meta">
                    <span>Applied: {formatDate(app.appliedAt || app.createdAt)}</span>
                    {match > 0 && <span className="student-app-match">{match}% match</span>}
                  </div>
                  {(app.reason || app.recommendationReason) && (
                    <p className="student-app-reason">
                      <strong>AI insight:</strong> {app.reason || app.recommendationReason}
                    </p>
                  )}
                  <div className="student-app-actions">
                    {app.internshipId && (
                      <Link
                        to={ROUTES.internships.detail(app.internshipId)}
                        className="saas-btn saas-btn-outline btn-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} />
                        View Internship
                      </Link>
                    )}
                    <button
                      type="button"
                      className="saas-btn saas-btn-primary btn-sm"
                      onClick={() => setSelectedApp(app)}
                    >
                      <Eye size={14} />
                      View Full Application
                    </button>
                  </div>
                </DashboardCard>
              )
            })}
          </div>
        )}

        {selectedApp && (
          <div className="student-app-detail-overlay" onClick={() => setSelectedApp(null)}>
            <div className="student-app-detail-wrap" onClick={(e) => e.stopPropagation()} role="presentation">
            <DashboardCard className="student-app-detail" hoverable={false}>
              <div className="student-app-detail-header">
                <h3 className="ds-card-title">Application details</h3>
                <button type="button" className="saas-icon-btn" onClick={() => setSelectedApp(null)}>
                  <X size={18} />
                </button>
              </div>
              <dl className="student-app-detail-list">
                <div><dt>Internship</dt><dd>{selectedApp.title}</dd></div>
                <div><dt>Organization</dt><dd>{selectedApp.company || '—'}</dd></div>
                <div><dt>Status</dt><dd>{normalizeStatus(selectedApp.status)}</dd></div>
                <div><dt>Applied</dt><dd>{formatDate(selectedApp.appliedAt || selectedApp.createdAt)}</dd></div>
                <div><dt>Student email</dt><dd>{selectedApp.studentEmail || student.email}</dd></div>
                {toMatchPercent(selectedApp.matchScore ?? selectedApp.score) > 0 && (
                  <div>
                    <dt>Match score</dt>
                    <dd>{toMatchPercent(selectedApp.matchScore ?? selectedApp.score)}%</dd>
                  </div>
                )}
                {(selectedApp.reason || selectedApp.recommendationReason) && (
                  <div>
                    <dt>AI recommendation</dt>
                    <dd>{selectedApp.reason || selectedApp.recommendationReason}</dd>
                  </div>
                )}
              </dl>
            </DashboardCard>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentApplicationsModal
