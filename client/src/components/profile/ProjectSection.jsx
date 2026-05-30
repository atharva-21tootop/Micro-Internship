import { useState } from 'react'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import './ProjectSection.css'

const ProjectSection = ({ projects = [], isEditing, onAddProject, onDeleteProject }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    techStack: '',
    link: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddProject = () => {
    if (newProject.title && newProject.description) {
      const techArray = newProject.techStack
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech)

      onAddProject({
        ...newProject,
        techStack: techArray,
        id: Date.now().toString()
      })

      setNewProject({
        title: '',
        description: '',
        techStack: '',
        link: ''
      })
      setShowAddForm(false)
    }
  }

  return (
    <div className="project-section">
      <div className="section-header">
        <h3>Projects</h3>
        {isEditing && (
          <button 
            className="add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={18} />
            Add Project
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="project-form">
          <input
            type="text"
            name="title"
            placeholder="Project Title"
            value={newProject.title}
            onChange={handleInputChange}
            className="form-input"
          />
          <textarea
            name="description"
            placeholder="Project Description"
            value={newProject.description}
            onChange={handleInputChange}
            className="form-textarea"
            rows="3"
          />
          <input
            type="text"
            name="techStack"
            placeholder="Technologies (comma-separated)"
            value={newProject.techStack}
            onChange={handleInputChange}
            className="form-input"
          />
          <input
            type="url"
            name="link"
            placeholder="Project Link (optional)"
            value={newProject.link}
            onChange={handleInputChange}
            className="form-input"
          />
          <div className="form-actions">
            <button className="btn-primary" onClick={handleAddProject}>
              Add Project
            </button>
            <button className="btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. {isEditing ? 'Add your first project!' : 'Add projects to showcase your work.'}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h4>{project.title}</h4>
                {isEditing && (
                  <button 
                    className="delete-btn"
                    onClick={() => onDeleteProject(project.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <p className="project-description">{project.description}</p>
              {project.techStack && project.techStack.length > 0 && (
                <div className="tech-tags">
                  {project.techStack.map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                  ))}
                </div>
              )}
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                  View Project <ExternalLink size={16} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectSection
