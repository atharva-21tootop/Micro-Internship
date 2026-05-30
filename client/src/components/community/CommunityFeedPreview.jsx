import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToDiscussions } from '@/services/communityService'
import '@/pages/student/StudentDashboard.css'

import { ROUTES } from '@/config/routes'

const CommunityFeedPreview = ({ title = 'Community Feed', viewAllLink = ROUTES.student.community, limit = 5 }) => {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const unsub = subscribeToDiscussions((data) => {
      setPosts((data || []).slice(0, limit))
    }, { limitCount: limit })
    return () => unsub()
  }, [limit])

  return (
    <div className="community-feed-preview">
      <div className="recommendations-header">
        <h3>{title}</h3>
        {viewAllLink && (
          <Link to={viewAllLink} className="btn btn-outline btn-sm">
            View All
          </Link>
        )}
      </div>
      <div className="community-feed-list">
        {posts.length === 0 ? (
          <p className="sidebar-empty-msg">No community posts yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="community-feed-item">
              <h4>{post.title}</h4>
              <p>
                {(post.description || post.content || '').slice(0, 120)}
                {(post.description || post.content || '').length > 120 ? '…' : ''}
              </p>
              <span className="feed-meta">
                {post.authorName || post.createdByName || 'Member'} · {post.category || 'General'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommunityFeedPreview
