import { useEffect, useState } from 'react'
import {
  RefreshCw,
  Download,
  Trash2,
  CheckCircle,
  Ban,
  Activity,
  Loader,
  AlertCircle,
} from 'lucide-react'
import './AdminUtilities.css'
import PageContainer from '@/components/common/PageContainer'
import DashboardCard from '@/components/common/DashboardCard'
import SectionHeader from '@/components/common/SectionHeader'
import { PageShell, SkeletonBlock } from '@/components/common/SaaSPrimitives'
import {
  approveAllPendingApi,
  clearInternshipsApi,
  exportReportsApi,
  fetchAuditLogs,
  refreshAdminDataApi,
  rejectInvalidInternshipsApi,
} from '@/services/api/adminApi'
import { formatDate } from '@/utils/formatDate'

const AdminUtilities = () => {
  const [message, setMessage] = useState(null)
  const [busyAction, setBusyAction] = useState(null)
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(true)

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const data = await fetchAuditLogs()
      setLogs(data.logs || [])
    } catch {
      setLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const runAction = async (key, action, successText) => {
    setBusyAction(key)
    setMessage(null)
    try {
      await action()
      setMessage({ type: 'success', text: successText })
      await loadLogs()
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Action failed. Please try again.' })
    } finally {
      setBusyAction(null)
    }
  }

  const utilities = [
    {
      key: 'refresh',
      title: 'Refresh Dashboard Data',
      description: 'Reload cached admin metrics and internship summaries.',
      icon: RefreshCw,
      action: () => runAction('refresh', refreshAdminDataApi, 'Dashboard data refreshed.'),
    },
    {
      key: 'export',
      title: 'Export Reports',
      description: 'Generate a platform activity and internship report.',
      icon: Download,
      action: () => runAction('export', exportReportsApi, 'Report export started.'),
    },
    {
      key: 'approve-all',
      title: 'Approve All Pending',
      description: 'Bulk approve internships awaiting admin review.',
      icon: CheckCircle,
      action: () =>
        runAction('approve-all', approveAllPendingApi, 'Pending internships approved.'),
    },
    {
      key: 'reject-invalid',
      title: 'Reject Invalid Postings',
      description: 'Remove incomplete or invalid internship listings.',
      icon: Ban,
      action: () =>
        runAction('reject-invalid', rejectInvalidInternshipsApi, 'Invalid internships rejected.'),
    },
    {
      key: 'clear',
      title: 'Clear All Internships',
      description: 'Remove all internship records. Use with caution.',
      icon: Trash2,
      action: () => {
        if (window.confirm('Clear ALL internships? This cannot be undone.')) {
          runAction('clear', clearInternshipsApi, 'All internships cleared.')
        }
      },
    },
  ]

  return (
    <PageContainer className="admin-utilities-page">
      <PageShell
        eyebrow="Admin"
        title="System Utilities"
        description="Maintenance tools, bulk operations, and audit logs."
      />

      {message && (
        <div className={`admin-utilities-message message-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="admin-utilities-grid ds-grid ds-grid-3">
        {utilities.map(({ key, title, description, icon: Icon, action }) => (
          <DashboardCard key={key} hoverable={false}>
            <h3 className="admin-utilities-card-title">
              <Icon size={18} />
              {title}
            </h3>
            <p className="admin-utilities-card-desc">{description}</p>
            <button
              type="button"
              className="saas-btn saas-btn-primary btn-sm"
              onClick={action}
              disabled={busyAction === key}
            >
              {busyAction === key ? <Loader size={16} className="spinner" /> : 'Run'}
            </button>
          </DashboardCard>
        ))}
      </div>

      <div className="admin-utilities-logs">
        <DashboardCard hoverable={false}>
          <SectionHeader
            title="Audit Logs"
            actions={
              <button type="button" className="saas-btn saas-btn-outline btn-sm" onClick={loadLogs}>
                <RefreshCw size={16} />
                Refresh
              </button>
            }
          />
          {loadingLogs ? (
            <SkeletonBlock rows={4} />
          ) : logs.length === 0 ? (
            <p className="empty">No audit logs yet.</p>
          ) : (
            <ul>
              {logs.map((log) => (
                <li key={log.id}>
                  <span>
                    <Activity size={14} /> {log.action} — {log.targetId || 'system'}
                  </span>
                  <span>{formatDate(log.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>
    </PageContainer>
  )
}

export default AdminUtilities
