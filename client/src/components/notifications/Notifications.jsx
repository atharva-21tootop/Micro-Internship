import { useState, useEffect } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { auth } from '@/services/firebase/client'
import {
  subscribeToUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notificationService'
import './Notifications.css'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserNotifications(user.uid, (data) => {
      setNotifications(data.filter(n => !n.deleted))
      setUnreadCount(data.filter(n => !n.read && !n.deleted).length)
    })

    return () => unsubscribe()
  }, [user])

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    try {
      await markAllNotificationsAsRead(user.uid)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!user) return null

  return (
    <div className="notifications-container">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-actions">
                {unreadCount > 0 && (
                  <button
                    className="mark-all-read-btn"
                    onClick={handleMarkAllAsRead}
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button
                  className="close-btn"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {notification.type === 'application_accepted' && '✅'}
                      {notification.type === 'application_rejected' && '❌'}
                      {notification.type === 'new_internship' && '🆕'}
                      {notification.type === 'application_received' && '📨'}
                      {notification.type === 'internship_approved' && '✓'}
                      {notification.type === 'internship_rejected' && '✗'}
                      {!notification.type && '🔔'}
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{notification.title}</p>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{formatTime(notification.createdAt)}</span>
                      {!notification.read && (
                        <button
                          className="mark-read-link"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="unread-indicator" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Notifications

