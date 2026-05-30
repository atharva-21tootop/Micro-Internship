import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Users, DollarSign, CheckCircle } from 'lucide-react'
import './InternshipDetail.css'
import PageContainer from '@/components/common/PageContainer'
import DashboardCard from '@/components/common/DashboardCard'
import { PageShell, SkeletonBlock } from '@/components/common/SaaSPrimitives'
import { ROUTES } from '@/config/routes'
import { auth } from '@/services/firebase/client'
import { getUser } from '@/services/userService'
import { getInternshipById } from '@/services/internshipService'
import { applyToInternship, getApplicationsByUser } from '@/services/applicationService'
import { formatDate } from '@/utils/formatDate'

const InternshipDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [internship, setInternship] = useState(null)
  const [user, setUser] = useState(null)
  const [isApplied, setIsApplied] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUser(firebaseUser.uid)
        setUser({ ...firebaseUser, ...userData })
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const loadInternship = async () => {
      if (!id) return
      try {
        const data = await getInternshipById(id)
        if (data) setInternship(data)
        else navigate(ROUTES.internships.browse)
      } catch (error) {
        console.error('Error loading internship:', error)
        navigate(ROUTES.internships.browse)
      } finally {
        setLoading(false)
      }
    }
    loadInternship()
  }, [id, navigate])

  useEffect(() => {
    const checkApplication = async () => {
      if (!user || !id) return
      try {
        const applications = await getApplicationsByUser(user.uid)
        setIsApplied(applications.some((app) => app.internshipId === id))
      } catch (error) {
        console.error('Error checking application:', error)
      }
    }
    checkApplication()
  }, [user, id])

  const handleApply = () => {
    if (!user) {
      navigate(ROUTES.login)
      return
    }
    if (!isApplied) setShowApplicationForm(true)
  }

  const handleApplicationSubmit = async (e) => {
    e.preventDefault()
    try {
      await applyToInternship({
        internshipId: id,
        studentId: user.uid,
        studentName: user.fullName || user.displayName || user.email,
        studentEmail: user.email,
        orgId: internship.orgId || 'unknown-org',
        title: internship.title,
        company: internship.company,
        duration: internship.duration,
        type: internship.type,
      })
      setIsApplied(true)
      setShowApplicationForm(false)
      alert('Application submitted successfully!')
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application. Please try again.')
    }
  }

  if (loading) {
    return (
      <PageContainer className="internship-detail">
        <SkeletonBlock rows={4} />
      </PageContainer>
    )
  }

  if (!internship) {
    return (
      <PageContainer className="internship-detail">
        <PageShell title="Internship not found" actions={<Link to={ROUTES.internships.browse} className="saas-btn saas-btn-outline">Back to Internships</Link>} />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="internship-detail">
      <PageShell
        eyebrow={internship.company || 'Company'}
        title={internship.title || 'Internship'}
        description={`${internship.location || 'Remote'} · ${internship.duration || '3 months'} · ${internship.type || 'Internship'}`}
        actions={
          <Link to={ROUTES.internships.browse} className="saas-btn saas-btn-outline">
            <ArrowLeft size={16} />
            Back
          </Link>
        }
      />

      <div className="detail-content ds-grid ds-grid-2">
        <div className="detail-main">
          <DashboardCard hoverable={false}>
            <div className="details-grid">
              <div className="detail-item"><MapPin size={20} /><div><span className="label">Location</span><span className="value">{internship.location || 'Remote'}</span></div></div>
              <div className="detail-item"><Clock size={20} /><div><span className="label">Duration</span><span className="value">{internship.duration || '3 months'}</span></div></div>
              <div className="detail-item"><Users size={20} /><div><span className="label">Type</span><span className="value">{internship.type || 'Full-time'}</span></div></div>
              <div className="detail-item"><DollarSign size={20} /><div><span className="label">Stipend</span><span className="value">{internship.stipend || internship.salary || 'Not specified'}</span></div></div>
            </div>
          </DashboardCard>

          <DashboardCard hoverable={false} className="description-section">
            <h2 className="ds-card-title">Role Description</h2>
            <div className="description-content">
              {(internship.roleDescription || internship.fullDescription || internship.description || 'No description available').split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard hoverable={false} className="requirements-section">
            <h2 className="ds-card-title">Requirements</h2>
            <ul className="requirements-list">
              {(Array.isArray(internship.requirements) ? internship.requirements : [internship.requirements || 'No specific requirements']).map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </DashboardCard>

          {internship.skills?.length > 0 && (
            <DashboardCard hoverable={false} className="skills-section">
              <h2 className="ds-card-title">Skills Required</h2>
              <div className="skills-tags">
                {internship.skills.filter(Boolean).map((skill) => (
                  <span key={skill} className="ds-tag">{skill}</span>
                ))}
              </div>
            </DashboardCard>
          )}
        </div>

        <DashboardCard hoverable={false} className="application-card">
          <h3 className="ds-card-title">Apply for this Internship</h3>
          <p className="ds-card-subtitle">{internship.applicationsCount || internship.applicants || 0} people applied</p>
          {internship.approved !== true ? (
            <p className="pending-approval-msg">This internship is pending admin approval.</p>
          ) : !isApplied ? (
            <button type="button" className="saas-btn saas-btn-primary btn-lg" onClick={handleApply}>Apply Now</button>
          ) : (
            <div className="applied-status"><CheckCircle size={24} /><span>Application Submitted</span></div>
          )}
          <div className="application-info">
            <p><strong>Deadline:</strong> {formatDate(internship.applyByDate) !== 'N/A' ? formatDate(internship.applyByDate) : 'Not specified'}</p>
            <p><strong>Start Date:</strong> {formatDate(internship.startDate) !== 'N/A' ? formatDate(internship.startDate) : 'Not specified'}</p>
          </div>
        </DashboardCard>
      </div>

      {showApplicationForm && (
        <div className="application-modal">
          <DashboardCard className="modal-content">
            <h2 className="ds-card-title">Apply for {internship.title}</h2>
            <form onSubmit={handleApplicationSubmit} className="application-form">
              <div className="form-group">
                <label className="form-label">Cover Letter</label>
                <textarea className="form-textarea" placeholder="Tell us why you're interested..." rows="6" required />
              </div>
              <div className="form-group">
                <label className="form-label">Resume/CV</label>
                <input type="file" className="form-input" accept=".pdf,.doc,.docx" required />
              </div>
              <div className="form-actions">
                <button type="button" className="saas-btn saas-btn-outline" onClick={() => setShowApplicationForm(false)}>Cancel</button>
                <button type="submit" className="saas-btn saas-btn-primary">Submit Application</button>
              </div>
            </form>
          </DashboardCard>
        </div>
      )}
    </PageContainer>
  )
}

export default InternshipDetail
