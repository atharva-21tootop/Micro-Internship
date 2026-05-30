import { CheckCircle2, Circle } from 'lucide-react'
import './ProfileCompleteness.css'

const ProfileCompleteness = ({ percentage, missing, suggestions }) => {
  const getColor = (percent) => {
    if (percent >= 80) return '#10b981'
    if (percent >= 60) return '#f59e0b'
    if (percent >= 40) return '#ef4444'
    return '#ef4444'
  }

  const getLabel = (percent) => {
    if (percent >= 80) return 'Excellent'
    if (percent >= 60) return 'Good'
    if (percent >= 40) return 'Fair'
    return 'Incomplete'
  }

  return (
    <div className="profile-completeness">
      <div className="completeness-header">
        <h4>Profile Completeness</h4>
        <span className="completeness-percent">{percentage}%</span>
      </div>

      <div className="progress-bar-wrapper">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: getColor(percentage)
            }}
          />
        </div>
        <span className="progress-label" style={{ color: getColor(percentage) }}>
          {getLabel(percentage)}
        </span>
      </div>

      {missing.length > 0 && (
        <div className="missing-fields">
          <h5>Complete Your Profile</h5>
          <ul className="suggestions-list">
            {suggestions.slice(0, 3).map((suggestion, idx) => (
              <li key={idx}>
                <Circle size={16} />
                <span>{suggestion}</span>
              </li>
            ))}
            {missing.length > 3 && (
              <li className="more-items">
                <span>+{missing.length - 3} more to complete</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {percentage === 100 && (
        <div className="completeness-success">
          <CheckCircle2 size={20} />
          <p>Your profile is 100% complete! 🎉</p>
        </div>
      )}
    </div>
  )
}

export default ProfileCompleteness
