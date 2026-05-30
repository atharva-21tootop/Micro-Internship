const StatusBadge = ({ status = 'Pending', className = '' }) => {
  const normalized = String(status).toLowerCase()
  const statusClass = normalized.replace(/[^a-z0-9]+/g, '-')

  return (
    <span className={`status-badge status-${statusClass} ${className}`.trim()}>
      {status}
    </span>
  )
}

export default StatusBadge
