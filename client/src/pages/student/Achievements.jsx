import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Award, 
  Trophy, 
  Star, 
  Target, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Users,
  BookOpen,
  Code,
  Briefcase
} from 'lucide-react'
import './Achievements.css'
import PageContainer from '@/components/common/PageContainer'
import { PageShell, SkeletonBlock } from '@/components/common/SaaSPrimitives'
import { ROUTES } from '@/config/routes'

// Firebase services
import { auth } from '@/services/firebase/client'
import { subscribeToAchievementTemplates } from '@/services/achievementService'
import { subscribeToUserAchievements } from '@/services/achievementService'

// Icon mapping
const iconMap = {
  Briefcase,
  Code,
  Trophy,
  Users,
  BookOpen,
  Target,
  Award,
  Star,
  Calendar,
  TrendingUp
}

const Achievements = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [user, setUser] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  // Load achievement templates
  useEffect(() => {
    const unsubscribe = subscribeToAchievementTemplates((data) => {
      setTemplates(data)
    })
    return () => unsubscribe()
  }, [])

  // Load user achievements
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToUserAchievements(user.uid, (userAchievements) => {
      // Merge templates with user achievements
      const merged = templates.map(template => {
        const userAchievement = userAchievements.find(ua => ua.templateId === template.id)
        if (userAchievement) {
          return {
            ...template,
            ...userAchievement,
            icon: iconMap[template.iconName] || Award
          }
        }
        return {
          ...template,
          earned: false,
          progress: 0,
          earnedDate: null,
          icon: iconMap[template.iconName] || Award
        }
      })
      setAchievements(merged)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, templates])

  const categories = ['all', 'Internship', 'Skills', 'Performance', 'Collaboration', 'Learning', 'Leadership']

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  )

  const earnedAchievements = achievements.filter(a => a.earned)
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + (a.points || 0), 0)
  const completionRate = achievements.length > 0 
    ? Math.round((earnedAchievements.length / achievements.length) * 100)
    : 0

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#10b981'
      case 'rare': return '#3b82f6'
      case 'epic': return '#8b5cf6'
      case 'legendary': return '#f59e0b'
      default: return '#64748b'
    }
  }

  if (loading) {
    return (
      <div className="achievements-page">
        <div className="container">
          <div className="page-header">
            <h1>Loading achievements...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="achievements-page">
        <div className="container">
          <div className="page-header">
            <h1>Please login to view achievements</h1>
            <Link to="/login" className="back-btn">Go to Login</Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <PageContainer className="achievements-page">
        <SkeletonBlock rows={4} />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="achievements-page">
      <PageShell
        eyebrow="Student"
        title="Achievements"
        description="Track your progress and unlock new achievements."
        actions={
          <Link to={ROUTES.student.browse} className="saas-btn saas-btn-outline">
            ← Back to Dashboard
          </Link>
        }
      />

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <h3>{earnedAchievements.length}</h3>
              <p>Achievements Earned</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <h3>{totalPoints}</h3>
              <p>Total Points</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <h3>{completionRate}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <h3>Filter by Category</h3>
          <div className="filter-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="achievements-grid">
          {filteredAchievements.length === 0 ? (
            <p>No achievements available. Check back later!</p>
          ) : (
            filteredAchievements.map(achievement => {
              const Icon = achievement.icon || Award
              return (
                <div 
                  key={achievement.id} 
                  className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                >
                  <div className="achievement-header">
                    <div 
                      className="achievement-icon"
                      style={{ 
                        backgroundColor: achievement.earned ? getRarityColor(achievement.rarity || 'common') : '#e2e8f0',
                        color: achievement.earned ? 'white' : '#94a3b8'
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="achievement-info">
                      <h3>{achievement.title}</h3>
                      <p>{achievement.description}</p>
                      <div className="achievement-meta">
                        <span className="category">{achievement.category}</span>
                        <span className="points">{achievement.points || 0} pts</span>
                      </div>
                    </div>
                  </div>

                  {achievement.earned ? (
                    <div className="achievement-earned">
                      <div className="earned-badge">
                        <CheckCircle size={16} />
                        <span>Earned</span>
                      </div>
                      <div className="earned-date">
                        {achievement.earnedDate 
                          ? new Date(achievement.earnedDate).toLocaleDateString()
                          : 'Recently earned'}
                      </div>
                    </div>
                  ) : (
                    <div className="achievement-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${achievement.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {achievement.progress || 0}% Complete
                      </div>
                    </div>
                  )}

                  <div className="achievement-rarity">
                    <span 
                      className="rarity-badge"
                      style={{ backgroundColor: getRarityColor(achievement.rarity || 'common') }}
                    >
                      {(achievement.rarity || 'common').toUpperCase()}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Recent Achievements</h3>
          <div className="activity-list">
            {earnedAchievements.slice(0, 3).length === 0 ? (
              <p>No achievements earned yet. Keep working to unlock achievements!</p>
            ) : (
              earnedAchievements.slice(0, 3).map((achievement) => {
                const Icon = achievement.icon || Award
                const earnedDate = achievement.earnedDate 
                  ? new Date(achievement.earnedDate)
                  : new Date()
                const daysAgo = Math.floor((new Date() - earnedDate) / (1000 * 60 * 60 * 24))
                const timeAgo = daysAgo === 0 ? 'Today' 
                  : daysAgo === 1 ? '1 day ago'
                  : daysAgo < 7 ? `${daysAgo} days ago`
                  : daysAgo < 30 ? `${Math.floor(daysAgo / 7)} week${Math.floor(daysAgo / 7) > 1 ? 's' : ''} ago`
                  : `${Math.floor(daysAgo / 30)} month${Math.floor(daysAgo / 30) > 1 ? 's' : ''} ago`

                return (
                  <div key={achievement.id} className="activity-item">
                    <div className="activity-icon earned">
                      <Icon size={20} />
                    </div>
                    <div className="activity-content">
                      <p><strong>{achievement.title}</strong> achievement unlocked!</p>
                      <span className="activity-date">{timeAgo}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
    </PageContainer>
  )
}

export default Achievements
