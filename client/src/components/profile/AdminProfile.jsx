import { useEffect, useState } from 'react'
import { Shield, Activity, Mail, User } from 'lucide-react'
import { formatDate } from '@/utils/formatDate'
import { fetchAuditLogs } from '@/services/api/adminApi'

const AdminProfile = ({ userData }) => {
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  const adminActionsCount = logs.length

  useEffect(() => {
    fetchAuditLogs()
      .then((data) => setLogs(data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoadingLogs(false))
  }, [])

  const permissions = userData?.permissions || [
    'manage_users',
    'manage_internships',
    'approve_applications',
    'view_reports',
    'system_utilities',
  ]

  return (
    <div className="role-profile admin-profile">
      <h3>Admin Information</h3>
      <div className="info-grid">
        <div className="info-group">
          <label className="info-label"><User size={18} /> Name</label>
          <span className="info-value">{userData?.fullName || userData?.email}</span>
        </div>
        <div className="info-group">
          <label className="info-label"><Mail size={18} /> Email</label>
          <span className="info-value">{userData?.email}</span>
        </div>
        <div className="info-group">
          <label className="info-label"><Shield size={18} /> Role</label>
          <span className="info-value">Administrator</span>
        </div>
      </div>

      <h3>Permissions</h3>
      <div className="permissions-list">
        {permissions.map((perm) => (
          <span key={perm} className="skill-tag">{perm.replace(/_/g, ' ')}</span>
        ))}
      </div>

      <div className="admin-stats-row">
        <span className="skill-tag">Admin actions logged: {adminActionsCount}</span>
      </div>

      <h3>Activity Logs</h3>
      {loadingLogs ? (
        <p>Loading activity logs…</p>
      ) : logs.length === 0 ? (
        <p className="info-value">No activity logs yet.</p>
      ) : (
        <ul className="activity-logs-list">
          {logs.map((log) => (
            <li key={log.id} className="activity-log-item">
              <Activity size={16} />
              <div>
                <strong>{log.action}</strong>
                <span> — {log.targetId || 'system'}</span>
                <p>{formatDate(log.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminProfile
