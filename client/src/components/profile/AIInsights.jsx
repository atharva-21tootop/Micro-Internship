import { Link } from 'react-router-dom'
import { TrendingUp, AlertCircle, Star, Target, Briefcase } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { analyzeSkills, getCareerSuggestions } from '@/utils/profileUtils'
import { recommendInternships } from '@/services/ai/recommendationService'
import './AIInsights.css'

const AIInsights = ({ profile, internships = [], applications = [] }) => {
  const skills = profile.skills || []

  if (skills.length === 0) {
    return (
      <div className="ai-insights empty-state portfolio-card">
        <Star size={40} className="empty-icon" />
        <h4>Add skills to see insights</h4>
        <p>Your AI insights will appear once you add skills to your profile.</p>
      </div>
    )
  }

  const { strongSkills, specialization, weakAreas } = analyzeSkills(skills, profile.interests)
  const careerRoles = getCareerSuggestions(skills, profile.interests, specialization)
  const recommendations = recommendInternships(
    (internships || []).filter((i) => i.approved !== false),
    profile,
    3,
  )

  const strongLabel = strongSkills.length > 0
    ? `You are strong in ${strongSkills.slice(0, 4).join(', ')}`
    : `You are building skills in ${skills.slice(0, 4).join(', ')}`

  const weakLabel = weakAreas.length > 0
    ? `Improve: ${weakAreas.join(' / ')}`
    : 'Keep expanding your skill set'

  const pendingCount = applications.filter(
    (a) => !['accepted', 'completed'].includes(String(a.status || '').toLowerCase()),
  ).length

  return (
    <div className="ai-insights">
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-header">
            <TrendingUp size={20} />
            <h4>Skill Analysis</h4>
          </div>
          <div className="insight-content">
            <p>{strongLabel}</p>
            <span className="insight-badge success">Specialization: {specialization}</span>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <AlertCircle size={20} />
            <h4>Areas to Improve</h4>
          </div>
          <div className="insight-content">
            <p>{weakLabel}</p>
            <ul className="improvement-list">
              {weakAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <Star size={20} />
            <h4>Career Suggestions</h4>
          </div>
          <div className="insight-content">
            <p className="roles-intro">Recommended roles:</p>
            <div className="roles-list">
              {careerRoles.map((role) => (
                <div key={role} className="role-item">
                  <span className="role-name">{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="insight-card full-width">
          <div className="insight-header">
            <Briefcase size={20} />
            <h4>Internship Suggestions</h4>
          </div>
          <div className="insight-content">
            {recommendations.length === 0 ? (
              <p>Browse internships to get personalized matches.</p>
            ) : (
              <ul className="internship-suggest-list">
                {recommendations.map((item) => (
                  <li key={item.id}>
                    <Link to={ROUTES.student.internship(item.id)}>
                      {item.title} — {item.matchScore}% match
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {applications.length > 0 && (
              <p className="insight-tip">
                You have {applications.length} application(s) on record.
              </p>
            )}
          </div>
        </div>

        <div className="insight-card full-width">
          <div className="insight-header">
            <Target size={20} />
            <h4>Next Steps</h4>
          </div>
          <div className="insight-content">
            <ul className="next-steps-list">
              <li>Apply to internships matching your top skills</li>
              <li>Complete pending applications ({pendingCount})</li>
              <li>Add projects that use {specialization.toLowerCase()} technologies</li>
              <li>Focus on one improvement area this month</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIInsights
