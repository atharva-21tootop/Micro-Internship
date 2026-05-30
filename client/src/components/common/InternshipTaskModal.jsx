import { X, MapPin, Clock, Building2 } from 'lucide-react'
import './InternshipTaskModal.css'

const InternshipTaskModal = ({ internship, onClose }) => {
  if (!internship) return null

  const responsibilities = internship.responsibilities
    || internship.whatYouWillDo
    || internship.tasks
    || (internship.description ? [internship.description] : [])

  const responsibilityList = Array.isArray(responsibilities)
    ? responsibilities
    : String(responsibilities).split('\n').filter(Boolean)

  const skills = internship.skills || internship.requiredSkills || []

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="task-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <h2>{internship.title}</h2>
        <p className="task-modal-company">
          <Building2 size={16} />
          {internship.company || internship.organizationName || 'Organization'}
        </p>

        <div className="task-modal-meta">
          <span><Clock size={14} /> {internship.duration || 'Flexible'}</span>
          <span><MapPin size={14} /> {internship.location || 'Remote'}</span>
        </div>

        <section>
          <h3>Role Description</h3>
          <p>{internship.roleDescription || internship.description || 'No description provided.'}</p>
        </section>

        <section>
          <h3>What You Will Do</h3>
          <ul>
            {responsibilityList.length > 0 ? (
              responsibilityList.map((item, idx) => <li key={idx}>{item}</li>)
            ) : (
              <li>Contribute to team projects and deliver assigned tasks.</li>
            )}
          </ul>
        </section>

        <section>
          <h3>Required Skills</h3>
          <div className="task-modal-skills">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))
            ) : (
              <span className="info-muted">Skills not specified</span>
            )}
          </div>
        </section>

        {internship.organizationInfo && (
          <section>
            <h3>Organization Info</h3>
            <p>{internship.organizationInfo}</p>
          </section>
        )}
      </div>
    </div>
  )
}

export default InternshipTaskModal
