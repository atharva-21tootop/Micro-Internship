import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MessageCircle, 
  User, 
  Search, 
  Star,
  Award,
  CheckCircle,
  Plus,
  Clock,
  X,
  FileText,
  AlertCircle,
  Loader
} from 'lucide-react'
import './StudentDashboard.css'

// Firebase services
import { auth } from '@/services/firebase/client'
import { getUser } from '@/services/userService'
import { subscribeToInternships } from '@/services/internshipService'
import {
  subscribeToApplicationsByStudent,
  applyToInternship,
  getStudentApplicationsEnriched,
} from '@/services/applicationService'
import { formatDate } from '@/utils/formatDate'
import { openInternshipView } from '@/utils/internshipNav'
import { calculateProfileCompletion } from '@/utils/profileUtils'
import { isRecommendedMatch } from '@/utils/matchScore'
import { createNotification } from '@/services/notificationService'
import StatusBadge from '@/components/common/StatusBadge'
import RecommendationCard from '@/components/common/RecommendationCard'
import InternshipTaskModal from '@/components/common/InternshipTaskModal'
import { useAIRecommendations } from '@/hooks/useAIRecommendations'
import { fetchStudentStats } from '@/services/api/studentApi'
import { subscribeToDiscussions } from '@/services/communityService'
import { getApplicationTimeline, getProgressPercent } from '@/utils/applicationProgress'
import { getInternshipExternalLink } from '@/utils/internshipNav'
import DashboardCard from '@/components/common/DashboardCard'
import PageContainer from '@/components/common/PageContainer'
import { SkeletonBlock, PageShell, EmptyState } from '@/components/common/SaaSPrimitives'
import SectionHeader from '@/components/common/SectionHeader'
import InternshipCard from '@/components/common/InternshipCard'
import '@/components/common/InternshipCard.css'
import { ROUTES } from '@/config/routes'

const StudentDashboard = ({ section = 'internships', unified = false }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [internships, setInternships] = useState([])
  const [applications, setApplications] = useState([])
  const [activeTab, setActiveTab] = useState(section)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [search, setSearch] = useState("")
  const [dashboardStats, setDashboardStats] = useState(null)
  const [communityPosts, setCommunityPosts] = useState([])
  const [taskModalInternship, setTaskModalInternship] = useState(null)
  const pageSize = 10

  useEffect(() => {
    setActiveTab(section)
  }, [section])

  // Load current logged in user from Firestore
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const data = await getUser(firebaseUser.uid)
        setUser({ uid: firebaseUser.uid, ...data })
      } else {
        setUser(null)
      }
      setLoadingUser(false)
    })

    return () => unsub()
  }, [])

  // Load internships (Realtime) - NO MOCK DATA
  useEffect(() => {
    const unsub = subscribeToInternships((data) => {
      setInternships(data || [])
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user?.uid) return undefined

    const unsub = subscribeToApplicationsByStudent(user.uid, (data) => {
      setApplications(data || [])
    })

    getStudentApplicationsEnriched()
      .then((data) => {
        if (data?.length) setApplications(data)
      })
      .catch(() => {})

    return () => unsub()
  }, [user?.uid])

  const approvedInternships = useMemo(
    () => internships.filter((i) => i.approved !== false),
    [internships],
  )

  const aiProfile = useMemo(
    () => (user ? { uid: user.uid, skills: user.skills || [] } : null),
    [user?.uid, user?.skills?.join('|')],
  )

  const {
    recommendations: recommendedInternships,
    loading: loadingRecommendations,
    hasSkills,
    fallbackMessage: recFallbackMessage,
  } = useAIRecommendations(approvedInternships, aiProfile, 3)

  const profileCompletion = useMemo(
    () => calculateProfileCompletion(user, user, applications, 0),
    [user, applications],
  )

  const filteredInternships = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return internships
    return internships.filter(
      (i) =>
        i.title?.toLowerCase().includes(q) ||
        i.company?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q),
    )
  }, [internships, search])

  const totalPages = Math.max(1, Math.ceil(filteredInternships.length / pageSize))
  const pageInternships = useMemo(
    () => filteredInternships.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredInternships, currentPage, pageSize],
  )

  useEffect(() => {
    if (!user?.uid) return undefined

    let active = true
    fetchStudentStats()
      .then((data) => {
        if (active) setDashboardStats(data.stats)
      })
      .catch(() => {
        if (active) setDashboardStats(null)
      })

    return () => {
      active = false
    }
  }, [user?.uid, applications.length])

  useEffect(() => {
    const unsub = subscribeToDiscussions((posts) => {
      setCommunityPosts((posts || []).slice(0, 5))
    }, { limitCount: 5 })
    return () => unsub()
  }, [])

  const handleViewApplication = (app) => {
    const internshipData = app.internship || {
      id: app.internshipId,
      title: app.title,
      company: app.company,
      duration: app.duration,
      description: app.description,
      skills: app.skills,
      responsibilities: app.responsibilities,
      whatYouWillDo: app.whatYouWillDo,
      externalLink: app.externalLink,
    }

    if (getInternshipExternalLink(internshipData)) {
      openInternshipView(internshipData, navigate)
      return
    }

    openInternshipView(internshipData, navigate, {
      onInternalView: (intern) => setTaskModalInternship(intern),
    })
  }

  if (loadingUser) {
    return (
      <PageContainer>
        <SkeletonBlock rows={4} />
      </PageContainer>
    )
  }

  if (!user) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={24} />
        <p>Please login to view your dashboard.</p>
        <Link to="/login" className="btn btn-primary">Go to Login</Link>
      </div>
    )
  }

  // Apply handler with proper error handling
  const handleApply = async (intern) => {
    try {
      setError('')

      // Check for duplicate
      if (applications.some(a => a.internshipId === intern.id)) {
        setError("You have already applied for this internship.")
        setTimeout(() => setError(''), 5000)
        return
      }

      // Prepare application data
      const applicationData = {
        internshipId: intern.id,
        studentId: user.uid,
        studentName: user.fullName || user.firstName || user.email,
        studentEmail: user.email,
        orgId: intern.orgId || "unknown-org",
        title: intern.title,
        company: intern.company,
        duration: intern.duration,
        type: intern.type
      }

      // Submit application with validation
      await applyToInternship(applicationData)

      // Notify organization
      await createNotification({
        userId: intern.orgId || "unknown-org",
        type: "application_received",
        title: "New Application Received",
        message: `${user.fullName || user.email} applied for ${intern.title}`,
        relatedId: intern.id
      })

      // Show success and clear error
      alert("✅ Application submitted successfully!")
      setError('')
    } catch (err) {
      const errorMessage = err.message || "Failed to apply. Please try again."
      setError(errorMessage)
      setTimeout(() => setError(''), 5000)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return '#10b981'
      case 'rejected': return '#ef4444'
      case 'pending': return '#f59e0b'
      default: return '#64748b'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return <CheckCircle size={16} />
      case 'rejected': return <X size={16} />
      case 'pending': return <Clock size={16} />
      default: return <FileText size={16} />
    }
  }

  return (
    <PageContainer className={`student-dashboard ${unified ? 'student-dashboard-unified' : ''}`}>
      <div className={`dashboard-content dashboard-section-${activeTab}`}>
        {error && (
          <div className="dashboard-alert error-alert">
            <p>{error}</p>
          </div>
        )}

        {/* Sidebar */}
        {!unified && (
        <div className="sidebar">

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'internships' ? 'active' : ''}`}
              onClick={() => setActiveTab('internships')}
            >
              <Search size={20} />
              <span>Browse Internships</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <FileText size={20} />
              <span>My Applications</span>
            </button>

            <Link to={ROUTES.student.achievements} className="nav-item">
              <Award size={20} />
              <span>Achievements</span>
            </Link>

            <Link to={ROUTES.student.community} className="nav-item">
              <MessageCircle size={20} />
              <span>Community</span>
            </Link>

            <Link to={ROUTES.student.profile} className="nav-item">
              <User size={20} />
              <span>Profile</span>
            </Link>
          </nav>

          <div className="sidebar-footer">
            <div className="decorative-element">
              <div className="circle orange"></div>
              <div className="circle blue"></div>
              <div className="center-shape"></div>
            </div>
            <p>MITAOE Computer Department</p>
          </div>
        </div>
        )}

        {/* Main Content */}
        <div className="main-content dashboard-main-panel">
          <div className="dashboard-summary-bar">
            <span className="live-badge">Live</span>
            <span>Profile {profileCompletion.percentage}% complete</span>
            <span>{applications.length} application(s)</span>
            {dashboardStats && (
              <>
                <span>{dashboardStats.pending} pending</span>
                <span>{dashboardStats.accepted} accepted</span>
              </>
            )}
          </div>

          {activeTab === 'internships' && (
            <>
              <PageShell
                eyebrow="Student"
                title="Browse Internships"
                description="Explore opportunities matched to your skills and track applications."
              />

              {communityPosts.length > 0 && (
                <DashboardCard hoverable={false} className="community-feed-preview">
                  <SectionHeader
                    title="Community Feed"
                    actions={<Link to={ROUTES.student.community} className="saas-btn saas-btn-outline btn-sm">View All</Link>}
                  />
                  <div className="community-feed-list">
                    {communityPosts.map((post) => (
                      <div key={post.id} className="community-feed-item">
                        <h4>{post.title}</h4>
                        <p>{post.content?.slice(0, 120)}{(post.content?.length || 0) > 120 ? '…' : ''}</p>
                        <span className="feed-meta">{post.authorName || 'Member'} · {post.category || 'General'}</span>
                      </div>
                    ))}
                  </div>
                </DashboardCard>
              )}

              <div className="recommendations-section recommendations-top">
                <SectionHeader
                  title="Recommended for You"
                  badge={recommendedInternships.length > 0 ? 'AI Powered' : undefined}
                />
                {recFallbackMessage && (
                  <p className="rec-fallback-msg">{recFallbackMessage}</p>
                )}
                <div className="recommendations-grid">
                  {!hasSkills ? (
                    <div className="empty-recommendations">
                      <p>Add skills in your profile to unlock AI recommendations.</p>
                      <Link to={ROUTES.student.profile} className="btn btn-outline btn-sm">Edit Profile</Link>
                    </div>
                  ) : loadingRecommendations ? (
                    <div className="empty-recommendations">
                      <Loader size={20} className="spinner" />
                      <p>Finding the best matches for you…</p>
                    </div>
                  ) : recommendedInternships.length === 0 ? (
                    <div className="empty-recommendations">
                      <p>No strong matches yet. Try adding more skills or browse all internships below.</p>
                    </div>
                  ) : (
                    recommendedInternships.map((internship) => (
                      <RecommendationCard
                        key={internship.id}
                        internship={internship}
                        matchScore={internship.matchScore}
                        matchedSkills={internship.matchedSkills}
                        reason={internship.reason}
                        recommended={isRecommendedMatch(internship.matchScore)}
                        onApply={() => handleApply(internship)}
                      />
                    ))
                  )}
                </div>
              </div>

              <SectionHeader
                title="Available Internships"
                actions={
                  <div className="search-bar" style={{ minWidth: 280 }}>
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search by title, company, or skills..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                }
              />

              <div className="internships-grid">
                {filteredInternships.length === 0 ? (
                  <p>No internships available.</p>
                ) : (
                  pageInternships.map((intern) => {
                    const hasApplied = applications.some((a) => a.internshipId === intern.id)
                    return (
                      <InternshipCard
                        key={intern.id}
                        internship={intern}
                        hasApplied={hasApplied}
                        onApply={() => handleApply(intern)}
                        onView={() => openInternshipView(intern, navigate, {
                          onInternalView: () => setTaskModalInternship(intern),
                        })}
                      />
                    )
                  })
                )}
              </div>
              {filteredInternships.length > pageSize && (
                <div className="pagination-controls">
                  <button
                    className="btn btn-outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    className="btn btn-outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'applications' && (
            <div className="applications-timeline">
              <PageShell
                eyebrow="Student"
                title="My Applications"
                description="Track your application status and progress."
              />

              <div className="applications-list">
                {applications.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="You haven't applied yet"
                    description="Explore internships and submit your first application."
                    action={
                      <button type="button" className="saas-btn saas-btn-primary" onClick={() => setActiveTab('internships')}>
                        Explore Internships
                      </button>
                    }
                  />
                ) : (
                  applications.map((app) => {
                    const timeline = getApplicationTimeline(app.status)
                    const progress = getProgressPercent(app.status)
                    const displayStatus =
                      timeline.normalized === 'accepted'
                        ? 'Accepted'
                        : timeline.normalized === 'rejected'
                          ? 'Rejected'
                          : 'Pending'

                    return (
                      <DashboardCard key={app.id} className="application-timeline-item application-data-card" hoverable={false}>
                        <div className="timeline-row">
                          <div className="timeline-marker" style={{ borderColor: getStatusColor(displayStatus) }}>
                            {getStatusIcon(displayStatus)}
                          </div>
                          <div className="timeline-content">
                            <div className="application-header">
                              <div>
                                <h3 className="ds-card-title">{app.title || app.internship?.title || 'Internship'}</h3>
                                <p className="ds-card-subtitle">
                                  {app.company || app.internship?.company || 'Organization'}
                                </p>
                              </div>
                              <StatusBadge status={displayStatus} />
                            </div>

                            <div className="application-details">
                              <div className="detail-item">
                                <Clock size={14} />
                                <span>Applied: {formatDate(app.appliedAt)}</span>
                              </div>
                              <div className="detail-item">
                                <span>Duration: {app.duration || app.internship?.duration || 'N/A'}</span>
                              </div>
                              <div className="detail-item progress-detail">
                                <span>Progress: {progress}%</span>
                                <div className="progress-bar-track">
                                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            </div>

                            <div className="timeline-steps">
                              <div className={`step ${timeline.applied ? 'completed' : ''}`}>
                                <CheckCircle size={12} />
                                <span>Applied</span>
                              </div>
                              <div className={`step ${timeline.review ? 'completed' : ''} ${timeline.reviewActive ? 'active' : ''}`}>
                                {timeline.decision ? <CheckCircle size={12} /> : <Clock size={12} />}
                                <span>Review</span>
                              </div>
                              <div className={`step ${timeline.decision ? 'completed' : ''} ${timeline.normalized === 'rejected' ? 'rejected' : ''}`}>
                                {timeline.normalized === 'accepted' ? (
                                  <CheckCircle size={12} />
                                ) : timeline.normalized === 'rejected' ? (
                                  <X size={12} />
                                ) : (
                                  <Clock size={12} />
                                )}
                                <span>{timeline.decisionLabel}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="saas-btn saas-btn-outline btn-sm view-app-btn"
                              onClick={() => handleViewApplication(app)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </DashboardCard>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar — Applications */}
        {activeTab === 'internships' && (
        <DashboardCard hoverable={false} className="right-sidebar">
          <SectionHeader title="My Applications" />
          <div className="sidebar-content">
            {applications.length === 0 ? (
              <p className="sidebar-empty-msg">You haven&apos;t applied yet — explore internships</p>
            ) : (
              applications.map((app) => {
                const timeline = getApplicationTimeline(app.status)
                const displayStatus =
                  timeline.normalized === 'accepted'
                    ? 'Accepted'
                    : timeline.normalized === 'rejected'
                      ? 'Rejected'
                      : 'Pending'

                return (
                  <div key={app.id} className="sidebar-app-item">
                    <div className="application-header">
                      <h4 className="ds-card-title">{app.title || 'Internship'}</h4>
                      <StatusBadge status={displayStatus} />
                    </div>
                    <p className="ds-card-subtitle">{app.company || 'Organization'}</p>
                    <div className="card-meta">
                      <span className="applied-date">{formatDate(app.appliedAt)}</span>
                      <span className="progress">{getProgressPercent(app.status)}%</span>
                    </div>
                    <button type="button" className="saas-btn saas-btn-outline btn-sm" onClick={() => handleViewApplication(app)}>
                      View
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </DashboardCard>
        )}

      </div>

      {taskModalInternship && (
        <InternshipTaskModal
          internship={taskModalInternship}
          onClose={() => setTaskModalInternship(null)}
        />
      )}
    </PageContainer>
  )
}

export default StudentDashboard
