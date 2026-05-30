import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Users,
  FileText,
  Plus,
  Search,
  CheckCircle,
  X,
  Clock,
  Eye,
  Trash2,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Globe,
  MessageCircle,
} from 'lucide-react'
import CommunityPanel from '@/components/community/CommunityPanel'
import CommunityFeedPreview from '@/components/community/CommunityFeedPreview'
import './OrganizationDashboard.css'
import { auth } from '@/services/firebase/client'
import { getUser } from '@/services/userService'
import { createNotification } from '@/services/notificationService'
import {
  subscribeToOrgInternships,
  subscribeToOrgApplications,
  updateApplicationStatus,
  createInternship,
  updateInternship,
  deleteInternship
} from '@/services/organizationService'
import PageContainer from '@/components/common/PageContainer'
import SectionHeader from '@/components/common/SectionHeader'
import DashboardCard from '@/components/common/DashboardCard'
import { StatCard, SkeletonBlock, PageShell } from '@/components/common/SaaSPrimitives'
import { ROUTES } from '@/config/routes'

const OrganizationDashboard = ({ section = 'overview', unified = false }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [orgData, setOrgData] = useState(null)
  const [internships, setInternships] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(section)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [studentData, setStudentData] = useState({})
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    stipend: '',
    duration: '',
    description: '',
    requirements: '',
    skills: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    setActiveTab(section)
  }, [section])

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const data = await getUser(firebaseUser.uid)
        if (data && (data.role === 'organization' || data.role === 'org')) {
          setOrgData(data)
        } else {
          navigate('/login')
        }
        setLoading(false)
      } else {
        navigate('/login')
      }
    })
    return () => unsubscribe()
  }, [navigate])

  // Load internships
  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToOrgInternships(user.uid, (data) => {
      setInternships(data)
    })
    return () => unsubscribe()
  }, [user])

  // Load applications
  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToOrgApplications(user.uid, (data) => {
      setApplications(data)
    })
    return () => unsubscribe()
  }, [user])

  // Load student data for applications
  useEffect(() => {
    const loadStudentData = async () => {
      const studentIds = [...new Set(applications.map(a => a.studentId).filter(Boolean))]
      const data = {}
      for (const studentId of studentIds) {
        try {
          const student = await getUser(studentId)
          if (student) data[studentId] = student
        } catch (error) {
          console.error(`Error loading student ${studentId}:`, error)
        }
      }
      setStudentData(data)
    }
    if (applications.length > 0) {
      loadStudentData()
    }
  }, [applications])

  const calculateSkillMatch = (application, internship) => {
    if (!internship || !internship.skills || internship.skills.length === 0) return 0
    const student = studentData[application.studentId]
    if (!student || !student.skills || student.skills.length === 0) return 0
    
    const internshipSkills = internship.skills.map(s => s.toLowerCase())
    const studentSkills = student.skills.map(s => s.toLowerCase())
    const matched = internshipSkills.filter(skill => 
      studentSkills.some(ss => ss.includes(skill) || skill.includes(ss))
    )
    return Math.round((matched.length / internshipSkills.length) * 100)
  }

  const handleApplicationStatus = async (applicationId, status, studentId) => {
    try {
      await updateApplicationStatus(applicationId, status)
      
      // Notify student
      await createNotification({
        userId: studentId,
        type: status === 'Accepted' ? 'application_accepted' : 'application_rejected',
        title: status === 'Accepted' ? 'Application Accepted!' : 'Application Update',
        message: status === 'Accepted' 
          ? `Congratulations! Your application for ${selectedApplication?.title} has been accepted.`
          : `Your application for ${selectedApplication?.title} has been ${status.toLowerCase()}.`,
        relatedId: applicationId
      })

      setShowApplicationModal(false)
      setSelectedApplication(null)
      alert(`Application ${status.toLowerCase()} successfully!`)
    } catch (error) {
      console.error('Error updating application:', error)
      alert('Failed to update application status')
    }
  }

  const handleCloseInternship = async (internshipId) => {
    if (!window.confirm('Are you sure you want to close this internship? It will no longer accept new applications.')) {
      return
    }
    try {
      await updateInternship(internshipId, { status: 'closed' })
      alert('Internship closed successfully')
    } catch (error) {
      console.error('Error closing internship:', error)
      alert('Failed to close internship')
    }
  }

  const handleDeleteInternship = async (internshipId) => {
    if (!window.confirm('Are you sure you want to delete this internship? This action cannot be undone.')) {
      return
    }
    try {
      await deleteInternship(internshipId)
      alert('Internship deleted successfully')
    } catch (error) {
      console.error('Error deleting internship:', error)
      alert('Failed to delete internship')
    }
  }

  const getApplicationsForInternship = (internshipId) => {
    return applications.filter(app => app.internshipId === internshipId)
  }

  const getSortedApplications = (apps) => {
    if (sortBy === 'skill-match') {
      return [...apps].sort((a, b) => {
        const internshipA = internships.find(i => i.id === a.internshipId)
        const internshipB = internships.find(i => i.id === b.internshipId)
        const matchA = calculateSkillMatch(a, internshipA)
        const matchB = calculateSkillMatch(b, internshipB)
        return matchB - matchA
      })
    } else if (sortBy === 'recent') {
      return [...apps].sort((a, b) => (b.appliedAt || 0) - (a.appliedAt || 0))
    }
    return apps
  }

  const handleViewApplication = (application) => {
    setSelectedApplication(application)
    setShowApplicationModal(true)
  }

  const filteredApplications = applications.filter(app =>
    app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalInternships: internships.length,
    activeInternships: internships.filter(i => i.status === 'active').length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'Pending').length,
    acceptedApplications: applications.filter(a => a.status === 'Accepted').length,
    rejectedApplications: applications.filter(a => a.status === 'Rejected').length
  }

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleCreateInternship = async (e) => {
    e.preventDefault()
    setFormErrors({})
    setFormMessage({ type: '', text: '' })

    // Validate form
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.stipend.trim()) newErrors.stipend = 'Stipend is required'
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const internshipData = {
        title: formData.title,
        company: orgData?.companyName || orgData?.fullName || 'Company',
        location: formData.location,
        type: 'Internship',
        stipend: formData.stipend,
        duration: formData.duration,
        description: formData.description,
        requirements: formData.requirements || 'Not specified',
        skills: formData.skills
          ? formData.skills.split(',').map(s => s.trim()).filter(s => s)
          : [],
        perks: ['Certificate', 'Experience'],
        approved: false,
        status: 'active',
        views: 0,
        applicationsCount: 0
      }

      await createInternship(internshipData)
      setFormMessage({ type: 'success', text: 'Internship created successfully! It will appear once approved.' })
      
      // Reset form
      setFormData({
        title: '',
        location: '',
        stipend: '',
        duration: '',
        description: '',
        requirements: '',
        skills: ''
      })

      setTimeout(() => {
        setShowCreateModal(false)
        setFormMessage({ type: '', text: '' })
      }, 2000)
    } catch (error) {
      console.error('Error creating internship:', error)
      setFormMessage({ type: 'error', text: error.message || 'Failed to create internship. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <SkeletonBlock rows={4} />
      </PageContainer>
    )
  }

  return (
    <PageContainer className={`org-dashboard ${unified ? 'org-dashboard-unified' : ''}`}>
      {/* Header handled by global Header component */}

      <div className="org-content">
        {/* Sidebar */}
        <div className="org-sidebar">
          <nav className="org-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <TrendingUp size={20} />
              <span>Overview</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'internships' ? 'active' : ''}`}
              onClick={() => setActiveTab('internships')}
            >
              <Briefcase size={20} />
              <span>Internships</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <FileText size={20} />
              <span>Applications</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              <MessageCircle size={20} />
              <span>Community</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <Users size={20} />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="org-main">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <PageShell
                eyebrow="Organization"
                title="Dashboard Overview"
                description="Monitor internships, applications, and hiring activity."
                actions={
                  <button type="button" className="saas-btn saas-btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Create Internship
                  </button>
                }
              />

              <div className="stats-grid ds-grid ds-grid-stats">
                <StatCard icon={Briefcase} label="Total Internships" value={stats.totalInternships} tone="sky" />
                <StatCard icon={CheckCircle} label="Active Internships" value={stats.activeInternships} tone="emerald" />
                <StatCard icon={FileText} label="Total Applications" value={stats.totalApplications} tone="indigo" />
                <StatCard icon={Clock} label="Pending Review" value={stats.pendingApplications} tone="amber" />
              </div>

              <DashboardCard hoverable={false} className="recent-section">
                <SectionHeader title="Recent Applications" />
                <div className="applications-list">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="application-item">
                      <div className="app-info">
                        <h4>{app.title}</h4>
                        <p>{app.studentName || 'Student'}</p>
                      </div>
                      <div className="app-status">
                        <span className={`status-badge ${app.status?.toLowerCase()}`}>
                          {app.status || 'Pending'}
                        </span>
                      </div>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleViewApplication(app)}
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <p className="empty-state">No applications yet</p>
                  )}
                </div>
              </DashboardCard>

              <CommunityFeedPreview title="Community Feed" viewAllLink={null} limit={4} />
            </div>
          )}

          {activeTab === 'community' && (
            <>
              <CommunityFeedPreview title="Latest Posts" viewAllLink={null} limit={6} />
              <CommunityPanel user={user} userData={orgData} canCreate />
            </>
          )}

          {activeTab === 'internships' && (
            <div className="internships-section">
              <PageShell
                eyebrow="Organization"
                title="My Internships"
                description="Create and manage internship postings."
                actions={
                  <button type="button" className="saas-btn saas-btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Create New
                  </button>
                }
              />

              <div className="internships-grid ds-grid ds-grid-3">
                {internships.map((internship) => (
                  <DashboardCard key={internship.id} className="internship-card">
                    <div className="internship-card-header">
                      <h3 className="ds-card-title">{internship.title}</h3>
                      <span className={`status-badge ${internship.status || 'active'}`}>
                        {internship.status || 'Active'}
                      </span>
                    </div>
                    <p className="ds-card-subtitle">{internship.company}</p>
                    <div className="internship-card-meta">
                      <span><MapPin size={14} /> {internship.location}</span>
                      <span><Clock size={14} /> {internship.duration}</span>
                      <span><DollarSign size={14} /> {internship.salary}</span>
                    </div>
                    <p className="description">{internship.description?.substring(0, 100)}...</p>
                    <div className="internship-card-footer">
                      <div className="applicant-count">
                        <Users size={14} />
                        <span>{getApplicationsForInternship(internship.id).length} applicants</span>
                      </div>
                      <div className="internship-card-actions">
                        <button
                          type="button"
                          className="saas-btn saas-btn-outline btn-sm"
                          onClick={() => {
                            setSelectedInternship(internship.id)
                            setActiveTab('applications')
                          }}
                        >
                          <Eye size={16} />
                          View Applicants
                        </button>
                        {internship.status !== 'closed' && (
                          <button
                            type="button"
                            className="saas-btn saas-btn-outline btn-sm"
                            onClick={() => handleCloseInternship(internship.id)}
                          >
                            Close
                          </button>
                        )}
                        <button
                          type="button"
                          className="saas-btn saas-btn-outline btn-sm"
                          onClick={() => handleDeleteInternship(internship.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </DashboardCard>
                ))}
                {internships.length === 0 && (
                  <DashboardCard hoverable={false} className="empty-state-card ds-grid-span-full">
                    <Briefcase size={48} />
                    <h3 className="ds-card-title">No internships yet</h3>
                    <p className="ds-card-subtitle">Create your first internship posting</p>
                    <button type="button" className="saas-btn saas-btn-primary" onClick={() => setShowCreateModal(true)}>
                      <Plus size={18} />
                      Create Internship
                    </button>
                  </DashboardCard>
                )}
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="applications-section">
              <PageShell
                eyebrow="Organization"
                title="Applications"
                description="Review and manage student applications."
              />

              <SectionHeader
                title={selectedInternship ? 'Filtered Applications' : 'All Applications'}
                actions={
                  <div className="applications-controls">
                    {selectedInternship && (
                      <button type="button" className="saas-btn saas-btn-outline btn-sm" onClick={() => setSelectedInternship(null)}>
                        <X size={16} />
                        Clear Filter
                      </button>
                    )}
                    <div className="search-bar">
                      <Search size={18} />
                      <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="recent">Sort by Recent</option>
                      <option value="skill-match">Sort by Skill Match</option>
                    </select>
                  </div>
                }
              />

              {selectedInternship && (
                <p className="internship-filter-info">
                  Showing applications for: <strong>{internships.find((i) => i.id === selectedInternship)?.title}</strong>
                </p>
              )}

              <DashboardCard hoverable={false} className="applications-table">
                <div className="table-header">
                  <div className="col">Student</div>
                  <div className="col">Internship</div>
                  <div className="col">Skill Match</div>
                  <div className="col">Applied</div>
                  <div className="col">Status</div>
                  <div className="col">Actions</div>
                </div>
                {getSortedApplications(filteredApplications.filter(app => 
                  !selectedInternship || app.internshipId === selectedInternship
                )).map((app) => {
                  const internship = internships.find(i => i.id === app.internshipId)
                  const skillMatch = calculateSkillMatch(app, internship)
                  const student = studentData[app.studentId]
                  return (
                  <div key={app.id} className="table-row">
                    <div className="col">
                      <div className="student-info">
                        <div className="student-avatar">
                          {(app.studentName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4>{app.studentName || 'Student'}</h4>
                          <p>{app.studentEmail || ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <strong>{app.title}</strong>
                      <p>{app.company}</p>
                    </div>
                    <div className="col">
                      <div className="skill-match">
                        <div className="match-bar">
                          <div 
                            className="match-fill" 
                            style={{ width: `${skillMatch}%`, backgroundColor: skillMatch >= 70 ? '#10b981' : skillMatch >= 40 ? '#f59e0b' : '#ef4444' }}
                          />
                        </div>
                        <span className="match-percentage">{skillMatch}%</span>
                      </div>
                      {student?.skills && student.skills.length > 0 && (
                        <div className="student-skills-preview">
                          {student.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="skill-mini-tag">{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col">
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString()
                        : 'N/A'}
                    </div>
                    <div className="col">
                      <span className={`status-badge ${app.status?.toLowerCase()}`}>
                        {app.status || 'Pending'}
                      </span>
                    </div>
                    <div className="col">
                      <button
                        type="button"
                        className="saas-btn saas-btn-primary btn-sm"
                        onClick={() => handleViewApplication(app)}
                      >
                        <Eye size={16} />
                        Review
                      </button>
                    </div>
                  </div>
                  )
                })}
                {filteredApplications.length === 0 && (
                  <div className="empty-state">
                    <p>No applications found</p>
                  </div>
                )}
              </DashboardCard>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <PageShell eyebrow="Organization" title="Profile" description="Your organization details and contact information." />
              <DashboardCard hoverable={false} className="profile-card">
                <div className="profile-header">
                  <div className="org-avatar-large">
                    {(orgData?.companyName || orgData?.fullName || 'O').charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <h3>{orgData?.companyName || orgData?.fullName || 'Organization'}</h3>
                    <p>{orgData?.email}</p>
                  </div>
                </div>
                <div className="profile-details">
                  <div className="detail-item">
                    <Mail size={18} />
                    <span>{orgData?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <Phone size={18} />
                    <span>{orgData?.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={18} />
                    <span>{orgData?.address || 'N/A'}</span>
                  </div>
                </div>
              </DashboardCard>
            </div>
          )}
        </div>
      </div>

      {/* Application Review Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowApplicationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Review</h2>
              <button
                className="close-btn"
                onClick={() => setShowApplicationModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="application-details">
                <h3>{selectedApplication.title}</h3>
                <div className="detail-section">
                  <h4>Student Information</h4>
                  <p><strong>Name:</strong> {selectedApplication.studentName || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedApplication.studentEmail || 'N/A'}</p>
                  {studentData[selectedApplication.studentId] && (
                    <>
                      {studentData[selectedApplication.studentId].phone && (
                        <p><strong>Phone:</strong> {studentData[selectedApplication.studentId].phone}</p>
                      )}
                      {studentData[selectedApplication.studentId].skills && studentData[selectedApplication.studentId].skills.length > 0 && (
                        <div className="student-skills">
                          <strong>Skills:</strong>
                          <div className="skills-list">
                            {studentData[selectedApplication.studentId].skills.map((skill, idx) => (
                              <span key={idx} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {studentData[selectedApplication.studentId].resumeUrl && (
                        <a 
                          href={studentData[selectedApplication.studentId].resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="resume-link-btn"
                        >
                          <FileText size={16} />
                          View Resume
                        </a>
                      )}
                      {(studentData[selectedApplication.studentId].github || 
                        studentData[selectedApplication.studentId].linkedin || 
                        studentData[selectedApplication.studentId].portfolio) && (
                        <div className="external-links">
                          {studentData[selectedApplication.studentId].github && (
                            <a href={studentData[selectedApplication.studentId].github} target="_blank" rel="noopener noreferrer">
                              <Globe size={16} /> GitHub
                            </a>
                          )}
                          {studentData[selectedApplication.studentId].linkedin && (
                            <a href={studentData[selectedApplication.studentId].linkedin} target="_blank" rel="noopener noreferrer">
                              <Globe size={16} /> LinkedIn
                            </a>
                          )}
                          {studentData[selectedApplication.studentId].portfolio && (
                            <a href={studentData[selectedApplication.studentId].portfolio} target="_blank" rel="noopener noreferrer">
                              <Globe size={16} /> Portfolio
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="detail-section">
                  <h4>Application Details</h4>
                  <p><strong>Applied:</strong> {
                    selectedApplication.appliedAt
                      ? new Date(selectedApplication.appliedAt).toLocaleDateString()
                      : 'N/A'
                  }</p>
                  <p><strong>Status:</strong> {selectedApplication.status || 'Pending'}</p>
                  {internships.find(i => i.id === selectedApplication.internshipId) && (
                    <>
                      <p><strong>Duration:</strong> {selectedApplication.duration || 'N/A'}</p>
                      {(() => {
                        const relatedInternship = internships.find(i => i.id === selectedApplication.internshipId)
                        const skillMatch = relatedInternship ? calculateSkillMatch(selectedApplication, relatedInternship) : 0
                        return (
                          <div className="skill-match-display">
                            <strong>Skill Match:</strong>
                            <div className="match-bar-large">
                              <div 
                                className="match-fill" 
                                style={{ 
                                  width: `${skillMatch}%`,
                                  backgroundColor: skillMatch >= 70 ? '#10b981' : skillMatch >= 40 ? '#f59e0b' : '#ef4444'
                                }}
                              />
                            </div>
                            <span>{skillMatch}%</span>
                          </div>
                        )
                      })()}
                    </>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleApplicationStatus(selectedApplication.id, 'Accepted', selectedApplication.studentId)}
                >
                  <CheckCircle size={18} />
                  Accept
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleApplicationStatus(selectedApplication.id, 'Rejected', selectedApplication.studentId)}
                >
                  <X size={18} />
                  Reject
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowApplicationModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Internship Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Internship</h2>
              <button
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {formMessage.text && (
                <div className={`message ${formMessage.type}`}>
                  {formMessage.text}
                </div>
              )}
              <form onSubmit={handleCreateInternship} className="internship-form">
                <div className="form-group">
                  <label>Internship Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g., Frontend Development Intern"
                    disabled={isSubmitting}
                  />
                  {formErrors.title && <span className="error">{formErrors.title}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      placeholder="e.g., Pune"
                      disabled={isSubmitting}
                    />
                    {formErrors.location && <span className="error">{formErrors.location}</span>}
                  </div>

                  <div className="form-group">
                    <label>Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleFormChange}
                      placeholder="e.g., 3 months"
                      disabled={isSubmitting}
                    />
                    {formErrors.duration && <span className="error">{formErrors.duration}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Stipend *</label>
                  <input
                    type="text"
                    name="stipend"
                    value={formData.stipend}
                    onChange={handleFormChange}
                    placeholder="e.g., ₹ 10,000 - 15,000 per month"
                    disabled={isSubmitting}
                  />
                  {formErrors.stipend && <span className="error">{formErrors.stipend}</span>}
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Brief description of the internship role and responsibilities"
                    rows="4"
                    disabled={isSubmitting}
                  />
                  {formErrors.description && <span className="error">{formErrors.description}</span>}
                </div>

                <div className="form-group">
                  <label>Requirements</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleFormChange}
                    placeholder="Required qualifications, education, or experience"
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleFormChange}
                    placeholder="e.g., React, JavaScript, Node.js"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Internship'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default OrganizationDashboard

