import { Award, Trophy, Medal } from 'lucide-react'
import './AchievementsSection.css'

const normalizeStatus = (status = '') => String(status).toLowerCase()

const buildAutoAchievements = (applications = []) =>
  applications
    .filter((app) => ['accepted', 'completed'].includes(normalizeStatus(app.status)))
    .map((app) => ({
      id: `auto-${app.id}`,
      title: `Internship Completed: ${app.title || 'Role'}`,
      description: `Successfully completed at ${app.company || 'organization'}`,
      points: 50,
      type: 'auto',
      earnedDate: app.updatedAt || app.appliedAt,
    }))

const AchievementsSection = ({ achievements = [], applications = [] }) => {
  const autoAchievements = buildAutoAchievements(applications)
  const manualAchievements = achievements.filter((a) => a.type !== 'auto')
  const allItems = [...autoAchievements, ...manualAchievements]
  const totalPoints = allItems.reduce((sum, item) => sum + (item.points || 0), 0)

  return (
    <div className="achievements-section">
      <div className="achievements-summary portfolio-card">
        <div className="summary-stat">
          <Trophy size={22} />
          <div>
            <span className="summary-value">{totalPoints}</span>
            <span className="summary-label">Total Points</span>
          </div>
        </div>
        <div className="summary-stat">
          <Medal size={22} />
          <div>
            <span className="summary-value">{allItems.length}</span>
            <span className="summary-label">Badges Earned</span>
          </div>
        </div>
      </div>

      {allItems.length === 0 ? (
        <div className="portfolio-card empty-state-card">
          <p>No achievements yet. Complete internships or earn certificates to unlock badges.</p>
        </div>
      ) : (
        <div className="achievement-badges-grid">
          {allItems.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-badge-card ${achievement.type === 'auto' ? 'auto' : 'manual'}`}
            >
              <div className="badge-icon-wrap">
                <Award size={22} />
              </div>
              <div className="badge-content">
                <div className="badge-top">
                  <h4>{achievement.title}</h4>
                  {achievement.type === 'auto' ? (
                    <span className="badge-type auto">Auto</span>
                  ) : (
                    <span className="badge-type manual">Certificate</span>
                  )}
                </div>
                <p>{achievement.description}</p>
                <div className="badge-footer">
                  <span className="badge-points">+{achievement.points || 10} pts</span>
                  {achievement.earnedDate && (
                    <span className="badge-date">
                      {new Date(achievement.earnedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {applications.some((app) => normalizeStatus(app.status) === 'pending') && (
        <div className="portfolio-card pending-hint">
          <p>Pending applications may unlock achievements when accepted.</p>
        </div>
      )}
    </div>
  )
}

export default AchievementsSection
