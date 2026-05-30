import { useState } from 'react'
import { Plus, Trash2, Calendar, MapPin, Briefcase } from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import { formatDate as formatFirestoreDate } from '@/utils/formatDate'
import './InternshipSection.css'

const normalizeStatus = (status = 'pending') => String(status || 'pending')

const InternshipSection = ({
  applications = [],
  manualExperience = [],
  isEditing,
  onAddExperience,
  onDeleteExperience,
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
  })

  const pendingApps = applications.filter((app) =>
    ['pending', 'applied'].includes(normalizeStatus(app.status))
  )
  const acceptedApps = applications.filter((app) =>
    ['accepted', 'completed', 'active'].includes(normalizeStatus(app.status))
  )
  const rejectedApps = applications.filter((app) =>
    ['rejected', 'declined'].includes(normalizeStatus(app.status))
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewExperience((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company) {
      onAddExperience({
        ...newExperience,
        id: Date.now().toString(),
        type: 'manual',
      })
      setNewExperience({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
      })
      setShowAddForm(false)
    }
  }

  const formatShortDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const renderApplicationCard = (app) => (
    <div key={app.id} className="internship-portfolio-card applied">
      <div className="card-top">
        <h4>{app.title || app.internshipTitle || 'Internship Application'}</h4>
        <StatusBadge status={app.status || 'Pending'} />
      </div>
      <p className="company-name">{app.company}</p>
      <div className="internship-meta">
        {app.location && (
          <span className="meta-item"><MapPin size={14} />{app.location}</span>
        )}
        {app.duration && (
          <span className="meta-item"><Calendar size={14} />{app.duration}</span>
        )}
        {app.appliedAt && (
          <span className="meta-item">
            Applied: {formatFirestoreDate(app.appliedAt)}
          </span>
        )}
      </div>
      {app.internshipId && (
        <span className="linked-app">Linked to applications collection</span>
      )}
    </div>
  )

  return (
    <div className="internship-section">
      <div className="section-header">
        <h3><Briefcase size={20} /> Internship Portfolio</h3>
        {isEditing && (
          <button type="button" className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={18} />
            Add Internship Experience
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="experience-form portfolio-card">
          <div className="form-row">
            <input
              type="text"
              name="title"
              placeholder="Position Title"
              value={newExperience.title}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={newExperience.company}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={newExperience.location}
            onChange={handleInputChange}
            className="form-input"
          />
          <div className="form-row">
            <input type="date" name="startDate" value={newExperience.startDate} onChange={handleInputChange} className="form-input" />
            <input type="date" name="endDate" value={newExperience.endDate} onChange={handleInputChange} className="form-input" />
          </div>
          <textarea
            name="description"
            placeholder="Key responsibilities and achievements"
            value={newExperience.description}
            onChange={handleInputChange}
            className="form-textarea"
            rows="3"
          />
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleAddExperience}>Add Experience</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {acceptedApps.length > 0 && (
        <section className="internship-group">
          <h4>Completed / Accepted</h4>
          <div className="internship-cards">{acceptedApps.map(renderApplicationCard)}</div>
        </section>
      )}

      {pendingApps.length > 0 && (
        <section className="internship-group">
          <h4>Applied (Pending)</h4>
          <div className="internship-cards">{pendingApps.map(renderApplicationCard)}</div>
        </section>
      )}

      {rejectedApps.length > 0 && (
        <section className="internship-group">
          <h4>Rejected</h4>
          <div className="internship-cards">{rejectedApps.map(renderApplicationCard)}</div>
        </section>
      )}

      {manualExperience.length > 0 && (
        <section className="internship-group">
          <h4>Manual Experience</h4>
          <div className="internship-cards">
            {manualExperience.map((exp) => (
              <div key={exp.id} className="internship-portfolio-card manual">
                {isEditing && (
                  <button type="button" className="delete-btn" onClick={() => onDeleteExperience(exp.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
                <h4>{exp.title}</h4>
                <p className="company-name">{exp.company}</p>
                <div className="internship-meta">
                  {exp.location && <span className="meta-item"><MapPin size={14} />{exp.location}</span>}
                  <span className="meta-item">
                    <Calendar size={14} />
                    {formatShortDate(exp.startDate)} – {formatShortDate(exp.endDate) || 'Present'}
                  </span>
                </div>
                {exp.description && <p className="exp-description">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {applications.length === 0 && manualExperience.length === 0 && (
        <div className="portfolio-card empty-state-card">
          <p>No internship activity yet. Apply from the dashboard or add experience manually.</p>
        </div>
      )}
    </div>
  )
}

export default InternshipSection
