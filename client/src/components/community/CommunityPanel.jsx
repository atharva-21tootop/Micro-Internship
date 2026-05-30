import { useState, useEffect } from 'react'
import { Plus, MessageCircle, Calendar, Users } from 'lucide-react'
import {
  subscribeToDiscussions,
  subscribeToEvents,
  subscribeToStudyGroups,
  createDiscussion,
} from '@/services/communityService'
import { createCommunityPost } from '@/services/api/communityApi'
import { formatDate } from '@/utils/formatDate'
import CommunityFeedPreview from './CommunityFeedPreview'
import './CommunityPanel.css'

const CommunityPanel = ({ user, userData, canCreate = true, showFeed = true }) => {
  const [discussions, setDiscussions] = useState([])
  const [events, setEvents] = useState([])
  const [groups, setGroups] = useState([])
  const [activeSection, setActiveSection] = useState('discussions')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'General' })

  useEffect(() => {
    const unsubDiscussions = subscribeToDiscussions(setDiscussions, { limitCount: 30 })
    const unsubEvents = subscribeToEvents(setEvents, { upcomingOnly: false })
    const unsubGroups = subscribeToStudyGroups(setGroups)
    return () => {
      unsubDiscussions()
      unsubEvents()
      unsubGroups()
    }
  }, [])

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!canCreate || !user) return

    setSubmitting(true)
    try {
      try {
        await createCommunityPost({
          type: 'discussion',
          title: form.title,
          description: form.description,
          category: form.category,
        })
      } catch {
        await createDiscussion({
          title: form.title,
          content: form.description,
          description: form.description,
          authorId: user.uid,
          authorName,
          createdBy: user.uid,
          role: userData?.role || 'organization',
          category: form.category,
        })
      }
      setForm({ title: '', description: '', category: 'General' })
      setShowCreateModal(false)
    } catch (err) {
      alert(err.message || 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  const authorName = userData?.fullName || userData?.firstName || user?.email || 'Member'

  return (
    <div className="community-panel">
      {showFeed && <CommunityFeedPreview title="Live Community Feed" viewAllLink={null} limit={5} />}
      <div className="community-panel-header">
        <h2>Community</h2>
        {canCreate && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> New Post
          </button>
        )}
      </div>

      <div className="community-panel-tabs">
        <button
          type="button"
          className={activeSection === 'discussions' ? 'active' : ''}
          onClick={() => setActiveSection('discussions')}
        >
          <MessageCircle size={16} /> Discussions ({discussions.length})
        </button>
        <button
          type="button"
          className={activeSection === 'events' ? 'active' : ''}
          onClick={() => setActiveSection('events')}
        >
          <Calendar size={16} /> Events ({events.length})
        </button>
        <button
          type="button"
          className={activeSection === 'groups' ? 'active' : ''}
          onClick={() => setActiveSection('groups')}
        >
          <Users size={16} /> Groups ({groups.length})
        </button>
      </div>

      {activeSection === 'discussions' && (
        <div className="community-panel-list">
          {discussions.length === 0 ? (
            <p className="community-empty">No discussions yet. Create the first post.</p>
          ) : (
            discussions.map((post) => (
              <article key={post.id} className="community-panel-card">
                <h4>{post.title}</h4>
                <p>{post.description || post.content}</p>
                <div className="community-panel-meta">
                  <span>{post.authorName || post.createdByName || 'Member'}</span>
                  <span>{post.role || post.category || 'General'}</span>
                  <span>{formatDate(post.createdAt || post.timestamp)}</span>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {activeSection === 'events' && (
        <div className="community-panel-list">
          {events.length === 0 ? (
            <p className="community-empty">No events scheduled.</p>
          ) : (
            events.map((event) => (
              <article key={event.id} className="community-panel-card">
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <div className="community-panel-meta">
                  <span>{event.location || 'TBD'}</span>
                  <span>{formatDate(event.date)}</span>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {activeSection === 'groups' && (
        <div className="community-panel-list">
          {groups.length === 0 ? (
            <p className="community-empty">No study groups yet.</p>
          ) : (
            groups.map((group) => (
              <article key={group.id} className="community-panel-card">
                <h4>{group.name}</h4>
                <p>{group.description}</p>
                <div className="community-panel-meta">
                  <span>{group.memberCount || 0} members</span>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="community-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="community-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Community Post</h3>
            <p className="community-modal-sub">Posting as {authorName}</p>
            <form onSubmit={handleCreatePost}>
              <label>
                Title
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  required
                />
              </label>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Technical">Technical</option>
                  <option value="Career">Career</option>
                  <option value="Experience">Experience</option>
                </select>
              </label>
              <div className="community-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Publishing…' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityPanel
