import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users,
  MessageCircle,
  TrendingUp, 
  Award, 
  BarChart3,
  Download,
  Search,
  UserCheck,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Ban,
  Shield,
  Briefcase
} from 'lucide-react'
import './AdminDashboard.css'
import { auth } from '@/services/firebase/client'
import { getUser } from '@/services/userService'
import { formatDate } from '@/utils/formatDate'
import { approveInternship, rejectInternship } from '@/services/adminService'
import { disableUserApi } from '@/services/api/adminApi'
import CommunityPanel from '@/components/community/CommunityPanel'
import CommunityFeedPreview from '@/components/community/CommunityFeedPreview'
import { useAdminRealtime } from '@/hooks/useAdminRealtime'
import UserTable from '@/components/admin/UserTable'
import StudentApplicationsModal from '@/components/admin/StudentApplicationsModal'
import PageContainer from '@/components/common/PageContainer'
import SectionHeader from '@/components/common/SectionHeader'
import DashboardCard from '@/components/common/DashboardCard'
import { StatCard, SkeletonBlock, PageShell } from '@/components/common/SaaSPrimitives'
import { ROUTES } from '@/config/routes'

const AdminDashboard = ({ section = 'overview', unified = false }) => {
  const [activeTab, setActiveTab] = useState(section)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [user, setUser] = useState(null)
  const [adminUserData, setAdminUserData] = useState(null)
    const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [expandedInternship, setExpandedInternship] = useState(null)
  const [pendingPage, setPendingPage] = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [authReady, setAuthReady] = useState(false)
  const [applicationsStudent, setApplicationsStudent] = useState(null)

  const { data: realtime, loading: realtimeLoading } = useAdminRealtime(!!user && authReady)

  useEffect(() => {
    setActiveTab(section)
  }, [section])

  const portalUsers = realtime?.users || []
  const students = realtime?.students || []
  const organizations = realtime?.organizations || []
  const pendingInternships = realtime?.pendingInternships || []
  const allInternships = realtime?.internships || []
  const recentActivity = realtime?.recentActivity || []
  const adminStats = realtime?.stats || {}
  const internshipStats = realtime?.internshipStats || {}
  const departmentAnalytics = realtime?.departmentAnalytics || {}

  // Load admin user data (auth access is enforced by ProtectedRoute)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const data = await getUser(firebaseUser.uid)
        setUser(firebaseUser)
        setAdminUserData(data)
        setAuthReady(true)
      }
    })
    return () => unsubscribe()
  }, [])

  const filterPortalUser = (u) => {
    const term = userSearch.trim().toLowerCase()
    const name = (u.fullName || u.firstName || u.email || '').toLowerCase()
    const email = (u.email || '').toLowerCase()
    const matchesSearch =
      !term ||
      name.includes(term) ||
      email.includes(term) ||
      (u.firstName || '').toLowerCase().includes(term)
    const role = u.role === 'org' ? 'organization' : u.role
    const matchesRole =
      userRoleFilter === 'all' ||
      role === userRoleFilter ||
      (userRoleFilter === 'organization' && (u.role === 'org' || u.role === 'organization'))
    return matchesSearch && matchesRole
  }

  const filteredStudents = students.filter(filterPortalUser)
  const filteredOrganizations = organizations.filter(filterPortalUser)
  const filteredPortalUsers =
    userRoleFilter === 'student'
      ? filteredStudents
      : userRoleFilter === 'organization'
        ? filteredOrganizations
        : [...filteredStudents, ...filteredOrganizations]

  const handleDisableUser = async (userId, currentlyDisabled) => {
    if (!window.confirm(currentlyDisabled ? 'Enable this user?' : 'Disable this user?')) return
    try {
      await disableUserApi(userId, !currentlyDisabled)
      alert(currentlyDisabled ? 'User enabled' : 'User disabled')
    } catch (error) {
      alert(error.message || 'Failed to update user')
    }
  }

  const handleApproveInternship = async (internshipId) => {
    try {
      const internship =
        pendingInternships.find((i) => i.id === internshipId) ||
        allInternships.find((i) => i.id === internshipId)
      if (internship) {
        await approveInternship(internship)
      }
      alert('Internship approved successfully!')
    } catch (error) {
      console.error('Error approving internship:', error)
      alert('Failed to approve internship')
    }
  }

  const handleRejectInternship = async (internshipId) => {
    try {
      const internship =
        pendingInternships.find((i) => i.id === internshipId) ||
        allInternships.find((i) => i.id === internshipId)
      if (internship) {
        await rejectInternship(internship)
      }
      alert('Internship rejected')
    } catch (error) {
      console.error('Error rejecting internship:', error)
      alert('Failed to reject internship')
    }
  }


  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'community', label: 'Community', icon: MessageCircle },
    { id: 'internships', label: 'Manage Internships', icon: BookOpen },
    { id: 'analytics', label: 'Reports', icon: TrendingUp },
    { id: 'utilities', label: 'Utilities', icon: Shield },
    { id: 'profile', label: 'Profile', icon: UserCheck }
  ]

  if (!authReady || (realtimeLoading && !realtime)) {
    return (
      <PageContainer>
        <SkeletonBlock rows={4} />
      </PageContainer>
    )
  }

  const pendingPageSize = 10
  const pendingTotalPages = Math.max(1, Math.ceil(pendingInternships.length / pendingPageSize))
  const pagedPendingInternships = pendingInternships.slice(
    (pendingPage - 1) * pendingPageSize,
    pendingPage * pendingPageSize,
  )

  return (
    <PageContainer className={`admin-dashboard ${unified ? 'admin-dashboard-unified' : ''}`}>
      {/* Header handled by global Header component */}

      <div className="admin-content">
        {/* Sidebar Navigation */}
        <div className="admin-sidebar">
          <nav className="admin-nav">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="admin-main">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <PageShell
                eyebrow="Admin"
                title="Department Overview"
                description="Monitor users, internships, applications, and platform activity."
              />

              <SectionHeader
                title="Department Overview"
                badge="Live"
                actions={
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="period-select"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                }
              />

              <div className="metrics-grid ds-grid ds-grid-stats">
                <StatCard
                  icon={Users}
                  label="Portal Users"
                  value={adminStats.totalPortalUsers ?? portalUsers.length}
                  helper={`${departmentAnalytics.totalStudents} students · ${departmentAnalytics.totalOrganizations} orgs`}
                />
                <StatCard
                  icon={BookOpen}
                  label="Total Internships"
                  value={internshipStats.totalInternships}
                  helper={`+${internshipStats.activeInternships} active`}
                  tone="emerald"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Pending Approval"
                  value={adminStats?.pendingApprovals ?? internshipStats.pendingInternships}
                  helper="Requires review"
                  tone="amber"
                />
                <StatCard
                  icon={Briefcase}
                  label="Organizations"
                  value={adminStats?.organizationsCount ?? departmentAnalytics.totalOrganizations}
                  helper="Registered"
                  tone="sky"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Accepted Applications"
                  value={internshipStats.acceptedApplications}
                  helper={`${internshipStats.pendingApplications} pending`}
                  tone="emerald"
                />
                <StatCard
                  icon={Award}
                  label="Total Applications"
                  value={internshipStats.totalApplications}
                  helper={`${internshipStats.rejectedApplications} rejected`}
                />
              </div>

              <DashboardCard hoverable={false} className="activity-section">
                <SectionHeader title="Recent Student Activity" />
                <div className="activity-list">
                  {recentActivity.length === 0 ? (
                    <p className="info-value">No recent activity recorded.</p>
                  ) : (
                    recentActivity.map((item) => (
                      <div key={item.id} className="activity-item">
                        <div className="activity-icon">
                          <CheckCircle size={16} />
                        </div>
                        <div className="activity-content">
                          <p>{item.message || `${item.action} — ${item.targetId || 'system'}`}</p>
                          <span className="activity-time">{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DashboardCard>

              <CommunityFeedPreview title="Live Community Feed" viewAllLink={null} limit={4} />
            </div>
          )}

          {activeTab === 'community' && (
            <>
              <CommunityFeedPreview title="Latest Posts" viewAllLink={null} limit={6} />
              <CommunityPanel user={user} userData={adminUserData} canCreate />
            </>
          )}

          {activeTab === 'users' && (
            <div className="students-section">
              <SectionHeader
                title={`Manage Users (${portalUsers.length})`}
                badge="Live"
                actions={
                  <>
                    <div className="search-bar" style={{ minWidth: 240 }}>
                      <Search size={18} />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="period-select"
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="student">Students only</option>
                      <option value="organization">Organizations only</option>
                    </select>
                  </>
                }
              />

              {(userRoleFilter === 'all' || userRoleFilter === 'student') && (
                <div className="user-group-section">
                  <h3 className="user-group-title">
                    <Users size={18} /> Students ({filteredStudents.length})
                  </h3>
                  <UserTable
                    rows={filteredStudents}
                    onDisable={handleDisableUser}
                    onViewApplications={setApplicationsStudent}
                    formatDate={formatDate}
                  />
                </div>
              )}

              {(userRoleFilter === 'all' || userRoleFilter === 'organization') && (
                <div className="user-group-section">
                  <h3 className="user-group-title">
                    <Briefcase size={18} /> Organizations ({filteredOrganizations.length})
                  </h3>
                  <UserTable rows={filteredOrganizations} onDisable={handleDisableUser} formatDate={formatDate} />
                </div>
              )}

              {filteredPortalUsers.length === 0 && (
                <p className="info-value">No students or organizations found.</p>
              )}
            </div>
          )}

          {activeTab === 'internships' && (
            <div className="internships-section">
              <SectionHeader
                title="Internship Management"
                badge={`Live · ${allInternships.length} total`}
                actions={
                  <button
                    type="button"
                    className={`saas-btn ${showPendingOnly ? 'saas-btn-primary' : 'saas-btn-outline'}`}
                    onClick={() => setShowPendingOnly(!showPendingOnly)}
                  >
                    <AlertCircle size={18} />
                    Pending ({pendingInternships.length})
                  </button>
                }
              />

              {/* Pending Internships Section */}
              {(showPendingOnly || activeTab === 'internships') && pendingInternships.length > 0 && (
                <div className="pending-approvals">
                  <h3 className="pending-header">
                    <AlertCircle size={20} />
                    {pendingInternships.length} Internship(s) Awaiting Approval
                  </h3>
                  
                  <div className="pending-list">
                    {pagedPendingInternships.map(internship => (
                      <DashboardCard key={internship.id} className="pending-card" hoverable={false}>
                        <div 
                          className="pending-header-info"
                          onClick={() => setExpandedInternship(
                            expandedInternship === internship.id ? null : internship.id
                          )}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="pending-title">
                            <h4>{internship.title || 'Untitled'}</h4>
                            <span className="company-tag">{internship.company || 'N/A'}</span>
                          </div>
                          <div className="pending-meta">
                            <span className="location-badge">
                              📍 {internship.location || 'Location TBA'}
                            </span>
                            <span className="date-badge">
                              📅 {formatDate(internship.createdAt)}
                            </span>
                          </div>
                        </div>

                        {expandedInternship === internship.id && (
                          <div className="pending-details">
                            <div className="details-grid">
                              <div className="detail-item">
                                <label>Stipend:</label>
                                <p>{internship.stipend || 'Not Available'}</p>
                              </div>
                              <div className="detail-item">
                                <label>Duration:</label>
                                <p>{internship.duration || 'N/A'}</p>
                              </div>
                              <div className="detail-item">
                                <label>Start Date:</label>
                                <p>{internship.startDate || 'Immediately'}</p>
                              </div>
                              <div className="detail-item">
                                <label>Apply By:</label>
                                <p>{internship.applyByDate || 'Not Available'}</p>
                              </div>
                            </div>

                            <div className="detail-section">
                              <label>Description:</label>
                              <p>{internship.description || 'No description provided'}</p>
                            </div>

                            <div className="detail-section">
                              <label>Requirements:</label>
                              <p>{internship.requirements || 'No specific requirements'}</p>
                            </div>

                            {internship.skills && internship.skills.length > 0 && (
                              <div className="detail-section">
                                <label>Required Skills:</label>
                                <div className="skills-tags">
                                  {internship.skills.map((skill, idx) => (
                                    <span key={idx} className="skill-tag">{skill}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="detail-section">
                              <label>Organization ID:</label>
                              <p className="orgid-text">{internship.orgId || 'N/A'}</p>
                            </div>
                          </div>
                        )}

                        <div className="pending-actions">
                          <button
                            className="action-btn approve-btn"
                            onClick={() => {
                              if (window.confirm(`Approve internship "${internship.title}"?`)) {
                                handleApproveInternship(internship.id);
                              }
                            }}
                            title="Approve this internship"
                          >
                            <CheckCircle size={18} />
                            <span>Approve</span>
                          </button>
                          <button
                            className="action-btn reject-btn"
                            onClick={() => {
                              if (window.confirm(`Reject internship "${internship.title}"?`)) {
                                handleRejectInternship(internship.id);
                              }
                            }}
                            title="Reject this internship"
                          >
                            <Ban size={18} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </DashboardCard>
                    ))}
                  </div>
                  {pendingInternships.length > pendingPageSize && (
                    <div className="pagination-controls">
                      <button
                        className="btn btn-outline"
                        disabled={pendingPage === 1}
                        onClick={() => setPendingPage((page) => Math.max(1, page - 1))}
                      >
                        Previous
                      </button>
                      <span>Page {pendingPage} of {pendingTotalPages}</span>
                      <button
                        className="btn btn-outline"
                        disabled={pendingPage === pendingTotalPages}
                        onClick={() => setPendingPage((page) => Math.min(pendingTotalPages, page + 1))}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!showPendingOnly && (
                <>
                  {/* Stats Overview */}
                  <div className="internship-stats ds-grid ds-grid-stats">
                    <StatCard icon={Briefcase} label="Total Internships" value={internshipStats.totalInternships} tone="indigo" />
                    <StatCard icon={CheckCircle} label="Active Internships" value={internshipStats.activeInternships} tone="emerald" />
                    <StatCard icon={Award} label="Completed" value={internshipStats.completedInternships} tone="sky" />
                    <StatCard icon={AlertCircle} label="Pending Approval" value={internshipStats.pendingInternships} tone="amber" />
                    <StatCard icon={Users} label="Total Applications" value={internshipStats.totalApplications} tone="indigo" />
                  </div>

                  <DashboardCard hoverable={false} className="all-internships-list">
                    <SectionHeader title="All Internships" />
                    {allInternships.length === 0 ? (
                      <p>No internships in the system.</p>
                    ) : (
                      allInternships.slice(0, 15).map((internship) => (
                        <DashboardCard key={internship.id} className="pending-card compact" hoverable={false}>
                          <div className="pending-title">
                            <h4>{internship.title}</h4>
                            <span className="company-tag">{internship.company}</span>
                          </div>
                          <div className="pending-actions">
                            {internship.approved === false && (
                              <>
                                <button
                                  className="action-btn approve-btn"
                                  onClick={() => handleApproveInternship(internship.id)}
                                >
                                  <CheckCircle size={16} /> Approve
                                </button>
                                <button
                                  className="action-btn reject-btn"
                                  onClick={() => handleRejectInternship(internship.id)}
                                >
                                  <Ban size={16} /> Reject
                                </button>
                              </>
                            )}
                            <span className={`status-badge ${internship.approved === false ? 'pending' : 'active'}`}>
                              {internship.approved === false ? 'Pending' : 'Approved'}
                            </span>
                          </div>
                        </DashboardCard>
                      ))
                    )}
                  </DashboardCard>

                  <DashboardCard hoverable={false} className="application-breakdown">
                    <SectionHeader title="Application Status Breakdown" />
                    <div className="breakdown-chart">
                      <div className="breakdown-item">
                        <div className="breakdown-bar accepted" style={{width: internshipStats.totalApplications > 0 ? `${(internshipStats.acceptedApplications / internshipStats.totalApplications) * 100}%` : '0%'}}></div>
                        <span>Accepted: {internshipStats.acceptedApplications}</span>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-bar pending" style={{width: internshipStats.totalApplications > 0 ? `${(internshipStats.pendingApplications / internshipStats.totalApplications) * 100}%` : '0%'}}></div>
                        <span>Pending: {internshipStats.pendingApplications}</span>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-bar rejected" style={{width: internshipStats.totalApplications > 0 ? `${(internshipStats.rejectedApplications / internshipStats.totalApplications) * 100}%` : '0%'}}></div>
                        <span>Rejected: {internshipStats.rejectedApplications}</span>
                      </div>
                    </div>
                  </DashboardCard>
                </>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <PageShell
                eyebrow="Admin"
                title="Department Analytics"
                description="Platform metrics, engagement, and skill development insights."
                actions={
                  <button type="button" className="saas-btn saas-btn-outline">
                    <Download size={18} />
                    Export Report
                  </button>
                }
              />

              <div className="analytics-grid ds-grid ds-grid-3">
                <DashboardCard hoverable={false} className="analytics-card">
                  <SectionHeader title="Top Skills Developed" />
                  <div className="skills-list">
                    {(departmentAnalytics.topSkills || []).length === 0 ? (
                      <p className="info-value">No skill data yet.</p>
                    ) : (
                      departmentAnalytics.topSkills.map((skill, index) => (
                        <div key={index} className="skill-item">
                          <span className="skill-name">{skill}</span>
                          <div className="skill-bar">
                            <div
                              className="skill-progress"
                              style={{ width: `${100 - index * 15}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DashboardCard>

                <DashboardCard hoverable={false} className="analytics-card">
                  <SectionHeader title="Live Summary" />
                  <div className="engagement-stats">
                    <div className="engagement-item">
                      <span className="engagement-label">Students</span>
                      <span className="engagement-value">{departmentAnalytics.totalStudents}</span>
                    </div>
                    <div className="engagement-item">
                      <span className="engagement-label">Organizations</span>
                      <span className="engagement-value">{departmentAnalytics.totalOrganizations}</span>
                    </div>
                    <div className="engagement-item">
                      <span className="engagement-label">Internships</span>
                      <span className="engagement-value">{internshipStats.totalInternships}</span>
                    </div>
                    <div className="engagement-item">
                      <span className="engagement-label">Applications</span>
                      <span className="engagement-value">{internshipStats.totalApplications}</span>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard hoverable={false} className="analytics-card">
                  <SectionHeader title="Student Engagement" />
                  <div className="engagement-stats">
                    <div className="engagement-item">
                      <span className="engagement-label">Active Students</span>
                      <span className="engagement-value">{departmentAnalytics.activeStudents}</span>
                    </div>
                    <div className="engagement-item">
                      <span className="engagement-label">With Internships</span>
                      <span className="engagement-value">{departmentAnalytics.studentsWithInternships}</span>
                    </div>
                    <div className="engagement-item">
                      <span className="engagement-label">Engagement Rate</span>
                      <span className="engagement-value">
                        {departmentAnalytics.totalStudents > 0
                          ? Math.round(
                              (departmentAnalytics.studentsWithInternships /
                                departmentAnalytics.totalStudents) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <PageShell eyebrow="Admin" title="Profile" description="Manage your admin profile and preferences." />
              <DashboardCard hoverable={false} className="profile-card">
                <p>Manage your admin profile and preferences.</p>
                <Link to={ROUTES.admin.profile} className="saas-btn saas-btn-primary">Open Profile</Link>
              </DashboardCard>
            </div>
          )}

          {activeTab === 'utilities' && (
            <div className="utilities-section">
              <PageShell
                eyebrow="Admin"
                title="System Utilities"
                description="Administrative tools and maintenance actions."
              />
              <DashboardCard hoverable={false} className="utilities-card">
                <p>Run bulk operations, view logs, export reports, and refresh dashboard data.</p>
                <Link to={ROUTES.admin.utilities} className="saas-btn saas-btn-primary">Open Utilities Panel</Link>
              </DashboardCard>
            </div>
          )}
        </div>
      </div>

      {applicationsStudent && (
        <StudentApplicationsModal
          student={applicationsStudent}
          onClose={() => setApplicationsStudent(null)}
        />
      )}
    </PageContainer>
  )
}

export default AdminDashboard

