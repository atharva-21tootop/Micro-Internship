import { Tag, Sparkles } from 'lucide-react'
import { toMatchPercent, isRecommendedMatch } from '@/utils/matchScore'
import './RecommendationCard.css'

const RecommendationCard = ({
  internship,
  matchScore,
  matchedSkills = [],
  reason,
  recommended = false,
  onApply,
}) => {
  const percent = toMatchPercent(matchScore)
  const showRecommended = recommended || isRecommendedMatch(matchScore)

  const getMatchColor = (score) => {
    if (score >= 80) return 'excellent'
    if (score >= 60) return 'good'
    if (score >= 40) return 'fair'
    return 'low'
  }

  const displaySkills =
    matchedSkills.length > 0 ? matchedSkills : (internship.skills || []).slice(0, 3)

  return (
    <div className={`recommendation-card match-${getMatchColor(percent)}`}>
      {showRecommended && (
        <span className="recommended-badge">
          <Sparkles size={12} />
          Recommended
        </span>
      )}

      <div className="card-header">
        <div className="match-badge">
          <span className="match-percentage">{percent}%</span>
          <span className="match-label">Match</span>
        </div>
        <h3>{internship.title}</h3>
      </div>

      <div className="card-body">
        <p className="company-name">{internship.company}</p>
        <div className="location">📍 {internship.location || 'Remote'}</div>
        {reason && <p className="match-reason">{reason}</p>}

        {displaySkills.length > 0 && (
          <div className="tags matched-skills-tags">
            {displaySkills.slice(0, 4).map((skill) => (
              <span key={skill} className="tag matched">
                <Tag size={12} />
                {skill}
              </span>
            ))}
          </div>
        )}

        <p className="description">
          {internship.description?.substring(0, 100) || 'No description available'}...
        </p>

        <div className="card-footer">
          <span className="duration">⏱️ {internship.duration || 'Flexible'}</span>
          <button className="apply-btn" type="button" onClick={onApply}>
            Apply Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecommendationCard
