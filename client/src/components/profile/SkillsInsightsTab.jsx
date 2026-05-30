import { Target, TrendingUp, AlertCircle, Star } from 'lucide-react'
import { analyzeSkills, getCareerSuggestions } from '@/utils/profileUtils'
import './SkillsInsightsTab.css'

const SkillsInsightsTab = ({ profile }) => {
  const skills = profile?.skills || []
  const interests = profile?.interests || []
  const { strongSkills, specialization, weakAreas } = analyzeSkills(skills, interests)
  const careerRoles = getCareerSuggestions(skills, interests, specialization)

  return (
    <div className="skills-insights-tab">
      <div className="portfolio-card">
        <div className="portfolio-card-header">
          <Target size={20} />
          <h3>Skills &amp; Career Interests</h3>
        </div>
        <div className="skills-insights-tags">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))
          ) : (
            <p className="empty-hint">Add skills in Personal Info (Edit Profile) to see career insights.</p>
          )}
        </div>
        {interests.length > 0 && (
          <div className="interests-block">
            <h4>Career Interests</h4>
            <div className="skills-insights-tags">
              {interests.map((interest) => (
                <span key={interest} className="interest-tag">{interest}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div className="skills-insights-grid portfolio-card">
          <div className="insight-card">
            <div className="insight-header">
              <TrendingUp size={18} />
              <h4>Skill Strengths</h4>
            </div>
            <p>
              {strongSkills.length > 0
                ? `Strong in ${strongSkills.slice(0, 4).join(', ')}`
                : `Building expertise in ${skills.slice(0, 4).join(', ')}`}
            </p>
            <span className="insight-badge">Focus: {specialization}</span>
          </div>

          <div className="insight-card">
            <div className="insight-header">
              <AlertCircle size={18} />
              <h4>Growth Areas</h4>
            </div>
            {weakAreas.length > 0 ? (
              <ul className="growth-list">
                {weakAreas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            ) : (
              <p>Keep expanding your skill set across domains.</p>
            )}
          </div>

          <div className="insight-card full-width">
            <div className="insight-header">
              <Star size={18} />
              <h4>Suggested Roles</h4>
            </div>
            <div className="roles-list">
              {careerRoles.map((role) => (
                <span key={role} className="role-chip">{role}</span>
              ))}
            </div>
            <p className="insight-tip">
              Use AI recommendations on your dashboard and the Internships page to find matching openings.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillsInsightsTab
