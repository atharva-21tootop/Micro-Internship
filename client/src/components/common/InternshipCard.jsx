import { Star } from 'lucide-react'
import DashboardCard from '@/components/common/DashboardCard'

const InternshipCard = ({
  internship,
  hasApplied = false,
  onApply,
  onView,
  applyLabel = 'Apply Now',
}) => (
  <DashboardCard className="internship-card">
    <div className="internship-card-header">
      <div className="company-avatar">
        {(internship.company || 'C').charAt(0).toUpperCase()}
      </div>
      {internship.tag && <span className="card-tag">{internship.tag}</span>}
    </div>

    <h3 className="ds-card-title">{internship.title}</h3>
    <p className="ds-card-subtitle">{internship.company}</p>

    <div className="internship-card-meta">
      {internship.type && <span>{internship.type}</span>}
      {internship.duration && <span>{internship.duration}</span>}
    </div>

    {internship.skills?.length > 0 && (
      <div className="internship-card-skills">
        {internship.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="ds-tag">{skill}</span>
        ))}
      </div>
    )}

    <div className="internship-card-footer">
      <div className="internship-card-rating">
        <Star size={14} fill="currentColor" />
        <span>{internship.rating ?? '—'}</span>
      </div>
      <div className="internship-card-actions">
        {onView && (
          <button type="button" className="saas-btn saas-btn-outline btn-sm" onClick={onView}>
            View
          </button>
        )}
        <button
          type="button"
          className={`saas-btn ${hasApplied ? 'saas-btn-outline' : 'saas-btn-primary'} btn-sm`}
          disabled={hasApplied}
          onClick={onApply}
        >
          {hasApplied ? 'Applied' : applyLabel}
        </button>
      </div>
    </div>
  </DashboardCard>
)

export default InternshipCard
