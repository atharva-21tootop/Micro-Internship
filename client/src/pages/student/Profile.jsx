import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Award,
  Briefcase,
  BookOpen,
  Target,
  Star,
  Camera,
  Github,
  Linkedin,
  ExternalLink,
  Plus,
  FileText,
  Zap
} from 'lucide-react'
import './Profile.css'

import { generateResumeSummary } from '@/services/ai/resumeGenerator'
import ResumePreviewModal from '@/components/common/ResumePreviewModal'
import ProfileCompleteness from '@/components/profile/ProfileCompleteness'
import ProjectSection from '@/components/profile/ProjectSection'
import InternshipSection from '@/components/profile/InternshipSection'
import AchievementsSection from '@/components/profile/AchievementsSection'
import SkillsInsightsTab from '@/components/profile/SkillsInsightsTab'
import { useProfile } from '@/hooks/useProfile'
import { calculateProfileCompletion, getProfileCompletionSuggestions } from '@/utils/profileUtils'
import { ROUTES } from '@/config/routes'
import PageContainer from '@/components/common/PageContainer'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const [showResumeModal, setShowResumeModal] = useState(false)

  const {
    userData,
    formData,
    setFormData,
    profile,
    applications,
    achievements,
    loading,
    uploadingResume,
    saveProfile,
    resetForm,
    uploadResume,
  } = useProfile()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleResumeUpload = async (file) => {
    try {
      await uploadResume(file)
      alert('Resume uploaded successfully!')
    } catch (error) {
      alert(error.message || 'Failed to upload resume.')
    }
  }

  const handleAddProject = (project) => {
    setFormData((prev) => ({ ...prev, projects: [...(prev.projects || []), project] }))
  }

  const handleDeleteProject = (projectId) => {
    setFormData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== projectId),
    }))
  }

  const handleAddExperience = (exp) => {
    setFormData((prev) => ({ ...prev, experience: [...(prev.experience || []), exp] }))
  }

  const handleDeleteExperience = (expId) => {
    setFormData((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((e) => e.id !== expId),
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      })
      setNewInterest('')
    }
  }

  const handleRemoveInterest = (interestToRemove) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(interest => interest !== interestToRemove)
    })
  }

  const handleSave = async () => {
    try {
      await saveProfile(formData)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert(error.message || 'Failed to save profile. Please try again.')
    }
  }

  const handleGenerateResume = () => {
    generateResumeSummary(profile)
    setShowResumeModal(true)
  }

  const handleCancel = () => {
    resetForm()
    setIsEditing(false)
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'internships', label: 'Internships', icon: Briefcase },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'skills-insights', label: 'Skills & Insights', icon: Zap },
  ]

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="page-header">
            <h1>Loading profile...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="page-header">
            <h1>Profile not found</h1>
          </div>
        </div>
      </div>
    )
  }

  const displayName = userData.fullName || userData.firstName || userData.email || 'User'
  const role = userData.role || 'student'
  const isAdmin = role === 'admin'
  const isOrganization = role === 'organization' || role === 'org'
  const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0)
  
  const completionData = calculateProfileCompletion(userData, formData, applications, achievements.length)
  const completionSuggestions = getProfileCompletionSuggestions(completionData.missing)

  const backLink = isAdmin
    ? ROUTES.admin.overview
    : isOrganization
      ? ROUTES.organization.overview
      : ROUTES.student.browse

  if (isAdmin) {
    window.location.replace('/profile/admin')
    return null
  }

  if (isOrganization) {
    window.location.replace('/profile/organization')
    return null
  }

  return (
    <PageContainer className="profile-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Profile</h1>
            <p>Manage your personal information and preferences</p>
          </div>
          <Link to={backLink} className="back-btn">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-section">
                <div className="avatar-container">
                  <div className="avatar">
                    <div className="avatar-placeholder">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <button className="avatar-edit-btn">
                    <Camera size={16} />
                  </button>
                </div>
                <div className="profile-info">
                  <h2>{displayName}</h2>
                  <p className="user-email">{userData.email}</p>
                  <div className="profile-stats">
                    <div className="stat">
                      <span className="stat-value">{totalPoints}</span>
                      <span className="stat-label">Points</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{achievements.length}</span>
                      <span className="stat-label">Achievements</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                {!isEditing ? (
                  <>
                    <button 
                      className="btn btn-outline"
                      onClick={handleGenerateResume}
                    >
                      <FileText size={18} />
                      Generate Resume
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 size={18} />
                      Edit Profile
                    </button>
                  </>
                ) : (
                  <div className="edit-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={handleCancel}
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSave}
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Profile Completeness Bar */}
            {!isEditing && (
              <ProfileCompleteness 
                percentage={completionData.percentage}
                missing={completionData.missing}
                suggestions={completionSuggestions}
              />
            )}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'personal' && (
              <div className="personal-info">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-group">
                    <label className="info-label">
                      <User size={18} />
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <span className="info-value">{userData.firstName || 'Not set'}</span>
                    )}
                  </div>

                  <div className="info-group">
                    <label className="info-label">
                      <User size={18} />
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <span className="info-value">{userData.lastName || 'Not set'}</span>
                    )}
                  </div>

                  <div className="info-group">
                    <label className="info-label">
                      <Mail size={18} />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <span className="info-value">{userData.email || 'Not set'}</span>
                    )}
                  </div>

                  <div className="info-group">
                    <label className="info-label">
                      <Phone size={18} />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <span className="info-value">{userData.phone || 'Not set'}</span>
                    )}
                  </div>

                  <div className="info-group">
                    <label className="info-label">
                      <MapPin size={18} />
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="form-textarea"
                        rows="3"
                      />
                    ) : (
                      <span className="info-value">{userData.address || 'Not set'}</span>
                    )}
                  </div>

                  <div className="info-group">
                    <label className="info-label">
                      <Calendar size={18} />
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <span className="info-value">
                        {userData.dateOfBirth 
                          ? new Date(userData.dateOfBirth).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    )}
                  </div>

                  <div className="info-group full-width">
                    <label className="info-label">
                      <User size={18} />
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="form-textarea"
                        rows="4"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <span className="info-value">{userData.bio || 'No bio set'}</span>
                    )}
                  </div>

                  <div className="info-group full-width">
                    <label className="info-label">
                      <Target size={18} />
                      Skills
                    </label>
                    {isEditing ? (
                      <div className="skills-editor">
                        <div className="skills-input-group">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            className="form-input"
                            placeholder="Add a skill (e.g., React, Python)"
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={handleAddSkill}
                          >
                            <Plus size={16} />
                            Add
                          </button>
                        </div>
                        <div className="skills-tags">
                          {formData.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="remove-skill"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="skills-display">
                        {userData.skills && userData.skills.length > 0 ? (
                          userData.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))
                        ) : (
                          <span className="info-value">No skills added</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="info-group full-width">
                    <label className="info-label">
                      <Star size={18} />
                      Career Interests
                    </label>
                    {isEditing ? (
                      <div className="interests-editor">
                        <div className="interests-input-group">
                          <input
                            type="text"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                            className="form-input"
                            placeholder="Add an interest (e.g., Technology, Marketing)"
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={handleAddInterest}
                          >
                            <Plus size={16} />
                            Add
                          </button>
                        </div>
                        <div className="interests-tags">
                          {formData.interests.map((interest, index) => (
                            <span key={index} className="interest-tag">
                              {interest}
                              <button
                                type="button"
                                onClick={() => handleRemoveInterest(interest)}
                                className="remove-interest"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="interests-display">
                        {userData.interests && userData.interests.length > 0 ? (
                          userData.interests.map((interest, index) => (
                            <span key={index} className="interest-tag">{interest}</span>
                          ))
                        ) : (
                          <span className="info-value">No interests added</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="info-group full-width">
                    <label className="info-label">
                      <FileText size={18} />
                      Resume (PDF)
                    </label>
                    {isEditing ? (
                      <div className="resume-upload">
                        {formData.resumeUrl ? (
                          <div className="resume-info">
                            <FileText size={20} />
                            <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer">
                              View Current Resume
                            </a>
                            <span className="resume-status">Uploaded</span>
                          </div>
                        ) : null}
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleResumeUpload(e.target.files[0])
                            }
                          }}
                          className="file-input"
                          disabled={uploadingResume}
                        />
                        {uploadingResume && <p className="upload-status">Uploading...</p>}
                      </div>
                    ) : (
                      <div className="resume-display">
                        {userData.resumeUrl ? (
                          <a 
                            href={userData.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="resume-link"
                          >
                            <FileText size={18} />
                            View Resume
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="info-value">No resume uploaded</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="info-group full-width">
                    <label className="info-label">
                      <Github size={18} />
                      External Links
                    </label>
                    {isEditing ? (
                      <div className="links-editor">
                        <div className="link-input-group">
                          <Github size={16} />
                          <input
                            type="url"
                            name="github"
                            value={formData.github}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="GitHub profile URL"
                          />
                        </div>
                        <div className="link-input-group">
                          <Linkedin size={16} />
                          <input
                            type="url"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="LinkedIn profile URL"
                          />
                        </div>
                        <div className="link-input-group">
                          <ExternalLink size={16} />
                          <input
                            type="url"
                            name="portfolio"
                            value={formData.portfolio}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Portfolio website URL"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="links-display">
                        {userData.github && (
                          <a href={userData.github} target="_blank" rel="noopener noreferrer" className="external-link">
                            <Github size={16} />
                            GitHub
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {userData.linkedin && (
                          <a href={userData.linkedin} target="_blank" rel="noopener noreferrer" className="external-link">
                            <Linkedin size={16} />
                            LinkedIn
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {userData.portfolio && (
                          <a href={userData.portfolio} target="_blank" rel="noopener noreferrer" className="external-link">
                            <ExternalLink size={16} />
                            Portfolio
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {!userData.github && !userData.linkedin && !userData.portfolio && (
                          <span className="info-value">No links added</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <ProjectSection
                  projects={isEditing ? formData.projects : (userData.projects || [])}
                  isEditing={isEditing}
                  onAddProject={handleAddProject}
                  onDeleteProject={handleDeleteProject}
                />
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="academic-info portfolio-card">
                <h3>Academic Information</h3>
                <div className="info-grid">
                  <div className="info-group">
                    <label className="info-label">
                      <BookOpen size={18} />
                      Year
                    </label>
                    {isEditing ? (
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    ) : (
                      <span className="info-value">{userData.year || 'Not set'}</span>
                    )}
                  </div>

                  <div className="info-group">
                    <label className="info-label">
                      <BookOpen size={18} />
                      Branch
                    </label>
                    {isEditing ? (
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="Computer Engineering">Computer Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics Engineering">Electronics Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                      </select>
                    ) : (
                      <span className="info-value">{userData.branch || 'Not set'}</span>
                    )}
                  </div>

                  <div className="info-group">
                    <label className="info-label">
                      <User size={18} />
                      Roll Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <span className="info-value">{userData.rollNumber || 'Not set'}</span>
                    )}
                  </div>

                  <div className="info-group">
                    <label className="info-label">
                      <Calendar size={18} />
                      Join Date
                    </label>
                    <span className="info-value">
                      {userData.createdAt 
                        ? new Date(userData.createdAt).toLocaleDateString()
                        : 'Not available'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'internships' && (
              <InternshipSection
                applications={applications}
                manualExperience={isEditing ? formData.experience : (userData.experience || [])}
                isEditing={isEditing}
                onAddExperience={handleAddExperience}
                onDeleteExperience={handleDeleteExperience}
              />
            )}

            {activeTab === 'achievements' && (
              <AchievementsSection achievements={achievements} applications={applications} />
            )}

            {activeTab === 'skills-insights' && (
              <SkillsInsightsTab profile={profile} />
            )}
          </div>
        </div>
      {showResumeModal && (
        <ResumePreviewModal
          profile={profile}
          onClose={() => setShowResumeModal(false)}
        />
      )}
    </PageContainer>
  )
}

export default Profile
