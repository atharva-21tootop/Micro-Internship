import { Eye, Ban, FileText } from 'lucide-react'

const isStudentRow = (row) => {
  const role = row.role === 'org' ? 'organization' : row.role
  return role === 'student'
}

const UserTable = ({ rows, onDisable, onViewApplications, formatDate }) => {
  if (!rows.length) {
    return <p className="info-value">No users in this section.</p>
  }

  return (
    <div className="students-table">
      <div className="table-header">
        <div className="col">Name</div>
        <div className="col">Email</div>
        <div className="col">Role</div>
        <div className="col">Created At</div>
        <div className="col">Actions</div>
      </div>
      {rows.map((row) => (
        <div key={row.id} className="table-row">
          <div className="col">
            <div className="student-info">
              <div className="student-avatar student-avatar-role">
                {(row.fullName || row.email || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h4>{row.fullName || row.firstName || row.email}</h4>
                {row.disabled && <span className="status-badge rejected">Disabled</span>}
              </div>
            </div>
          </div>
          <div className="col">{row.email || '—'}</div>
          <div className="col">
            <span
              className={`status-badge ${
                row.role === 'organization' || row.role === 'org' ? 'organization' : 'student'
              }`}
            >
              {row.role === 'org' ? 'organization' : row.role || 'student'}
            </span>
          </div>
          <div className="col">{formatDate(row.createdAt)}</div>
          <div className="col col-actions">
            <button
              type="button"
              className="action-btn"
              onClick={() => {
                alert(
                  `Name: ${row.fullName || row.firstName || 'N/A'}\nEmail: ${row.email}\nRole: ${row.role}\nSkills: ${(row.skills || []).join(', ') || 'None'}`,
                )
              }}
            >
              <Eye size={16} />
              View
            </button>
            {isStudentRow(row) && onViewApplications && (
              <button
                type="button"
                className="action-btn action-btn-apps"
                onClick={() => onViewApplications(row)}
              >
                <FileText size={16} />
                View Applications
              </button>
            )}
            <button
              type="button"
              className="action-btn reject-btn"
              onClick={() => onDisable(row.id, row.disabled)}
            >
              <Ban size={16} />
              {row.disabled ? 'Enable' : 'Disable'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UserTable
