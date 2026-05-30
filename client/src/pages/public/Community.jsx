import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  MapPin,
  User,
  Reply
} from 'lucide-react'
import './Community.css'
import { getRoleHome } from '@/config/dashboardConfig'
import PageContainer from '@/components/common/PageContainer'
import { PageShell } from '@/components/common/SaaSPrimitives'

// Firebase services
import { auth } from '@/services/firebase/client'
import { getUser } from '@/services/userService'
import {
  subscribeToDiscussions,
  toggleDiscussionLike,
} from '@/services/communityService'
import { createCommunityPost } from '@/services/api/communityApi'
import {
  subscribeToEvents,
  joinEvent,
  createEvent
} from '@/services/communityService'
import {
  subscribeToStudyGroups,
  joinStudyGroup,
  createStudyGroup
} from '@/services/communityService'

/**
 * Community Component
 * Role-aware community platform supporting discussions, events, and study groups
 * 
 * Props:
 * - role: 'admin' | 'organization' | 'student' - Determines UI visibility and features
 */

const Community = ({ role = 'student' }) => {
  const [activeTab, setActiveTab] = useState('discussions')
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [discussions, setDiscussions] = useState([])
  const [events, setEvents] = useState([])
  const [studyGroups, setStudyGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDiscussionModal, setShowDiscussionModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showStudyGroupModal, setShowStudyGroupModal] = useState(false)
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: 'General',
    tags: ''
  })
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop',
    maxAttendees: 50
  })
  const [newStudyGroup, setNewStudyGroup] = useState({
    name: '',
    description: '',
    tags: ''
  })

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const data = await getUser(firebaseUser.uid)
        setUserData(data)
      }
    })
    return () => unsubscribe()
  }, [])

  // Load discussions
  useEffect(() => {
    const unsubscribe = subscribeToDiscussions((data) => {
      setDiscussions(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Load events
  useEffect(() => {
    const unsubscribe = subscribeToEvents((data) => {
      setEvents(data)
    })
    return () => unsubscribe()
  }, [])

  // Load study groups
  useEffect(() => {
    const unsubscribe = subscribeToStudyGroups((data) => {
      setStudyGroups(data)
    })
    return () => unsubscribe()
  }, [])

  const normalizedRole = role === 'org' ? 'organization' : role
  const isAdmin = normalizedRole === 'admin'
  const isOrganization = normalizedRole === 'organization'
  const isStudent = normalizedRole === 'student'

  const canCreateDiscussions = isAdmin || isOrganization
  const canCreateEvents = isAdmin || isOrganization
  const canCreateStudyGroups = isAdmin || isOrganization
  const canLikeAndJoin = Boolean(user)

  const roleHome = getRoleHome(
    isAdmin ? 'admin' : isOrganization ? 'organization' : 'student',
  )

  const roleDescription = isAdmin
    ? 'Moderate discussions, publish announcements, and manage community activity.'
    : isOrganization
      ? 'Share updates, host events, and engage with students on the platform.'
      : 'Browse discussions, join events, and participate in study groups.'

  const communityStats = {
    members: new Set(discussions.map((d) => d.authorId).filter(Boolean)).size + events.length,
    discussions: discussions.length,
    events: events.length,
    groups: studyGroups.length,
  }

  const tabs = [
    { id: 'discussions', label: 'Discussions', icon: MessageCircle },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'study-groups', label: 'Study Groups', icon: Users },
    { id: 'resources', label: 'Resources', icon: BookOpen }
  ]

  const handleLike = async (discussionId) => {
    if (!user) {
      alert('Please login to like discussions')
      return
    }
    
    const discussion = discussions.find(d => d.id === discussionId)
    const isLiked = discussion?.likedBy?.includes(user.uid) || false
    
    try {
      await toggleDiscussionLike(discussionId, user.uid, isLiked)
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('Failed to like discussion')
    }
  }

  const handleCreateDiscussion = async (e) => {
    e.preventDefault()
    if (!user || !userData) {
      alert('Please login to create discussions')
      return
    }

    if (!canCreateDiscussions) {
      alert('Only admins and organizations can create discussions')
      return
    }

    try {
      const tagsArray = newDiscussion.tags.split(',').map((t) => t.trim()).filter(Boolean)
      await createCommunityPost({
        type: 'discussion',
        title: newDiscussion.title,
        description: newDiscussion.content,
        category: newDiscussion.category,
        tags: tagsArray,
      })
      setShowDiscussionModal(false)
      setNewDiscussion({ title: '', content: '', category: 'General', tags: '' })
      alert('Discussion created successfully!')
    } catch (error) {
      console.error('Error creating discussion:', error)
      alert('Failed to create discussion')
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!user || !userData) {
      alert('Please login to create events')
      return
    }

    if (!canCreateEvents) {
      alert('Only admins and organizations can create events')
      return
    }

    try {
      await createEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: new Date(newEvent.date).toISOString(),
        time: newEvent.time,
        location: newEvent.location,
        organizer: userData.fullName || userData.firstName || 'Admin',
        organizerId: user.uid,
        category: newEvent.category,
        maxAttendees: parseInt(newEvent.maxAttendees)
      })
      setShowEventModal(false)
      setNewEvent({ title: '', description: '', date: '', time: '', location: '', category: 'Workshop', maxAttendees: 50 })
      alert('Event created successfully!')
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event')
    }
  }

  const handleCreateStudyGroup = async (e) => {
    e.preventDefault()
    if (!user || !userData) {
      alert('Please login to create study groups')
      return
    }

    if (!canCreateStudyGroups) {
      alert('Only admins and organizations can create study groups')
      return
    }

    try {
      const tagsArray = newStudyGroup.tags.split(',').map(t => t.trim()).filter(t => t)
      await createStudyGroup({
        name: newStudyGroup.name,
        description: newStudyGroup.description,
        tags: tagsArray,
        createdBy: user.uid,
        createdByName: userData.fullName || userData.firstName || user.email
      })
      setShowStudyGroupModal(false)
      setNewStudyGroup({ name: '', description: '', tags: '' })
      alert('Study group created successfully!')
    } catch (error) {
      console.error('Error creating study group:', error)
      alert('Failed to create study group')
    }
  }

  const handleJoinEvent = async (eventId) => {
    if (!user) {
      alert('Please login to join events')
      return
    }
    try {
      await joinEvent(eventId, user.uid)
      alert('Successfully joined event!')
    } catch (error) {
      console.error('Error joining event:', error)
      alert('Failed to join event')
  }
  }

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  return (
    <PageContainer className="community-page">
      <PageShell
        eyebrow="Community"
        title="Community Hub"
        description={roleDescription}
        actions={
          <Link to={roleHome} className="saas-btn saas-btn-outline">
            ← Back to Dashboard
          </Link>
        }
      />

        <div className="community-content">
          {/* Sidebar */}
          <div className="community-sidebar">
            <div className="sidebar-section">
              <h3>Quick Actions</h3>
              {canCreateDiscussions && (
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => {
                    if (!user) {
                      alert('Please login to create discussions')
                      return
                    }
                    setShowDiscussionModal(true)
                  }}
                >
                  <Plus size={18} />
                  Start Discussion
                </button>
              )}
              {canCreateEvents && (
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => {
                    if (!user) {
                      alert('Please login to create events')
                      return
                    }
                    setShowEventModal(true)
                  }}
                >
                  <Calendar size={18} />
                  Create Event
                </button>
              )}
              {canCreateStudyGroups && (
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => {
                    if (!user) {
                      alert('Please login to create study groups')
                      return
                    }
                    setShowStudyGroupModal(true)
                  }}
                >
                  <Users size={18} />
                  Create Study Group
                </button>
              )}
              {isStudent && (
                <p className="community-role-hint">
                  {canLikeAndJoin
                    ? 'You can like discussions and join events or study groups. Creating posts is limited to admins and organizations.'
                    : 'Sign in to participate in the community.'}
                </p>
              )}
            </div>

            <div className="sidebar-section">
              <h3>Trending Topics</h3>
              <div className="trending-topics">
                {[...new Set(discussions.flatMap((d) => d.tags || []).filter(Boolean))].slice(0, 4).map((tag) => (
                  <div key={tag} className="topic-item">
                    <TrendingUp size={16} />
                    <span>{tag}</span>
                  </div>
                ))}
                {discussions.length === 0 && <p className="info-value">No topics yet</p>}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Community Stats</h3>
              <div className="stats-list">
                <div className="stat-item">
                  <Users size={16} />
                  <span>{communityStats.members} Contributors</span>
                </div>
                <div className="stat-item">
                  <MessageCircle size={16} />
                  <span>{communityStats.discussions} Discussions</span>
                </div>
                <div className="stat-item">
                  <Calendar size={16} />
                  <span>{communityStats.events} Events</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>{communityStats.groups} Groups</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="community-main">
            {/* Search and Filter */}
            <div className="search-section">
              <div className="search-bar">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search discussions, events, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="filter-btn">
                <Filter size={18} />
                Filter
              </button>
            </div>

            {/* Tabs */}
            <div className="community-tabs">
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

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'discussions' && (
                <div className="discussions-content">
                  <div className="content-header">
                    <h2>Recent Discussions</h2>
                    {canCreateDiscussions && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          if (!user) {
                            alert('Please login to create discussions')
                            return
                          }
                          setShowDiscussionModal(true)
                        }}
                      >
                        <Plus size={18} />
                        New Discussion
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <p>Loading discussions...</p>
                  ) : (
                    <div className="discussions-list">
                      {filteredDiscussions.length === 0 ? (
                        <p>No discussions yet. Start the first one!</p>
                      ) : (
                        filteredDiscussions.map(discussion => (
                      <div key={discussion.id} className={`discussion-card ${discussion.isPinned ? 'pinned' : ''}`}>
                        {discussion.isPinned && (
                          <div className="pinned-badge">
                            <Award size={16} />
                            Pinned
                          </div>
                        )}
                        
                        <div className="discussion-header">
                          <div className="author-info">
                            <div className="author-avatar">
                              {discussion.authorAvatar}
                            </div>
                            <div>
                              <h4>{discussion.authorName || discussion.author || 'Anonymous'}</h4>
                              <span className="discussion-meta">
                                {formatTimeAgo(discussion.createdAt)} • {discussion.category || 'General'}
                              </span>
                            </div>
                          </div>
                          <button className="more-btn">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>

                        <div className="discussion-content">
                          <h3>{discussion.title}</h3>
                          <p>{discussion.content}</p>
                          {discussion.tags && discussion.tags.length > 0 && (
                            <div className="discussion-tags">
                              {discussion.tags.map((tag, index) => (
                                <span key={index} className="tag">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="discussion-footer">
                          <div className="discussion-actions">
                            <button 
                              className={`action-btn ${discussion.likedBy?.includes(user?.uid) ? 'liked' : ''}`}
                              onClick={() => handleLike(discussion.id)}
                            >
                              <Heart size={16} />
                              {discussion.likes || 0}
                            </button>
                            <button className="action-btn">
                              <Reply size={16} />
                              {discussion.replies || 0}
                            </button>
                            <button className="action-btn">
                              <Share2 size={16} />
                              Share
                            </button>
                          </div>
                          <div className="discussion-stats">
                            <span>{discussion.views || 0} views</span>
                          </div>
                        </div>
                      </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'events' && (
                <div className="events-content">
                  <div className="content-header">
                    <h2>Upcoming Events</h2>
                    {canCreateEvents && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          if (!user) {
                            alert('Please login to create events')
                            return
                          }
                          setShowEventModal(true)
                        }}
                      >
                        <Plus size={18} />
                        Create Event
                      </button>
                    )}
                  </div>

                  <div className="events-list">
                    {events.length === 0 ? (
                      <p>No upcoming events. Check back later!</p>
                    ) : (
                      events.map(event => (
                      <div key={event.id} className="event-card">
                        <div className="event-header">
                          <div className="event-date">
                            <Calendar size={20} />
                            <div>
                              <span className="date">
                                {event.date 
                                  ? (event.date.toDate ? event.date.toDate().toLocaleDateString() : new Date(event.date).toLocaleDateString())
                                  : 'TBD'}
                              </span>
                              <span className="time">{event.time || 'TBD'}</span>
                            </div>
                          </div>
                          <div className="event-category">{event.category || 'Event'}</div>
                        </div>

                        <div className="event-content">
                          <h3>{event.title}</h3>
                          <p>{event.description}</p>
                          <div className="event-details">
                            <div className="detail-item">
                              <MapPin size={16} />
                              <span>{event.location || 'TBD'}</span>
                            </div>
                            <div className="detail-item">
                              <User size={16} />
                              <span>Organized by {event.organizer || 'Admin'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="event-footer">
                          <div className="attendance">
                            <Users size={16} />
                            <span>{event.attendeeCount || 0}/{event.maxAttendees || 0} attending</span>
                          </div>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleJoinEvent(event.id)}
                          >
                            Join Event
                          </button>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'study-groups' && (
                <div className="study-groups-content">
                  <div className="content-header">
                    <h2>Study Groups</h2>
                    {canCreateStudyGroups && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          if (!user) {
                            alert('Please login to create study groups')
                            return
                          }
                          setShowStudyGroupModal(true)
                        }}
                      >
                        <Plus size={18} />
                        Create Group
                      </button>
                    )}
                  </div>

                  <div className="study-groups-list">
                    {studyGroups.length === 0 ? (
                      <p>No study groups available. Create one to get started!</p>
                    ) : (
                      studyGroups.map((group) => (
                        <div key={group.id} className="study-group-card">
                          <div className="group-header">
                            <h3>{group.name}</h3>
                            <span className="group-size">{group.memberCount || 0} members</span>
                          </div>
                          <p>{group.description}</p>
                          {group.tags && group.tags.length > 0 && (
                            <div className="group-tags">
                              {group.tags.map((tag, index) => (
                                <span key={index} className="tag">{tag}</span>
                              ))}
                            </div>
                          )}
                          <button 
                            className="btn btn-outline"
                            onClick={() => user && joinStudyGroup(group.id, user.uid)}
                          >
                            Join Group
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="resources-content">
                  <div className="content-header">
                    <h2>Learning Resources</h2>
                  </div>

                  <div className="resources-grid">
                    <div className="resource-card">
                      <div className="resource-icon">
                        <BookOpen size={24} />
                      </div>
                      <h3>Web Development Guide</h3>
                      <p>Complete guide to modern web development</p>
                      <div className="resource-meta">
                        <span>PDF • 2.5 MB</span>
                        <button className="btn btn-primary">Download</button>
                      </div>
                    </div>

                    <div className="resource-card">
                      <div className="resource-icon">
                        <BookOpen size={24} />
                      </div>
                      <h3>Interview Preparation</h3>
                      <p>Common interview questions and answers</p>
                      <div className="resource-meta">
                        <span>PDF • 1.8 MB</span>
                        <button className="btn btn-primary">Download</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Create Discussion Modal */}
      {showDiscussionModal && (
        <div className="modal-overlay" onClick={() => setShowDiscussionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Discussion</h2>
              <button className="close-btn" onClick={() => setShowDiscussionModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateDiscussion} className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({...newDiscussion, title: e.target.value})}
                  required
                  placeholder="Discussion title"
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({...newDiscussion, content: e.target.value})}
                  required
                  rows="5"
                  placeholder="What would you like to discuss?"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newDiscussion.category}
                  onChange={(e) => setNewDiscussion({...newDiscussion, category: e.target.value})}
                >
                  <option value="General">General</option>
                  <option value="Technical">Technical</option>
                  <option value="Experience">Experience</option>
                  <option value="Career">Career</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={newDiscussion.tags}
                  onChange={(e) => setNewDiscussion({...newDiscussion, tags: e.target.value})}
                  placeholder="React, JavaScript, Frontend"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDiscussionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button className="close-btn" onClick={() => setShowEventModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateEvent} className="modal-body">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  required
                  placeholder="Event name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  required
                  rows="4"
                  placeholder="Event description"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  required
                  placeholder="Event location"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Career">Career</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Attendees</label>
                  <input
                    type="number"
                    value={newEvent.maxAttendees}
                    onChange={(e) => setNewEvent({...newEvent, maxAttendees: e.target.value})}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Study Group Modal */}
      {showStudyGroupModal && (
        <div className="modal-overlay" onClick={() => setShowStudyGroupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Study Group</h2>
              <button className="close-btn" onClick={() => setShowStudyGroupModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateStudyGroup} className="modal-body">
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={newStudyGroup.name}
                  onChange={(e) => setNewStudyGroup({...newStudyGroup, name: e.target.value})}
                  required
                  placeholder="Study group name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newStudyGroup.description}
                  onChange={(e) => setNewStudyGroup({...newStudyGroup, description: e.target.value})}
                  required
                  rows="4"
                  placeholder="What will this group study?"
                />
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={newStudyGroup.tags}
                  onChange={(e) => setNewStudyGroup({...newStudyGroup, tags: e.target.value})}
                  placeholder="React, JavaScript, Frontend"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStudyGroupModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default Community
