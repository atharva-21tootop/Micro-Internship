import { X, Download } from 'lucide-react'
import './ResumePreviewModal.css'

const ResumePreviewModal = ({ profile, onClose }) => {
  const handleDownloadPDF = () => {
    try {
      // Create a new window for printing
      const resumeWindow = window.open('', '_blank', 'width=800,height=900')
      if (!resumeWindow) {
        alert('Please allow pop-ups to download the resume')
        return
      }

      const name = profile.fullName || profile.email || 'Resume'
      
      resumeWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${name} - Resume</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Arial', 'Helvetica', sans-serif;
                color: #1e293b;
                line-height: 1.6;
                padding: 40px;
                background: #ffffff;
              }
              h1 {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 5px;
                border-bottom: 3px solid #3b82f6;
                padding-bottom: 10px;
              }
              .contact-info {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 20px;
              }
              h3 {
                font-size: 14px;
                font-weight: bold;
                margin-top: 20px;
                margin-bottom: 10px;
                color: #1e293b;
                border-bottom: 1px solid #cbd5e1;
                padding-bottom: 5px;
              }
              .section-content {
                font-size: 13px;
                margin-bottom: 10px;
              }
              .skill-tag, .interest-tag {
                display: inline-block;
                background: #e0f2fe;
                color: #0369a1;
                padding: 3px 8px;
                border-radius: 12px;
                margin-right: 5px;
                margin-bottom: 5px;
                font-size: 11px;
              }
              .field {
                margin-bottom: 8px;
              }
              strong {
                color: #1e293b;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h1>${profile.fullName || 'Student Resume'}</h1>
            
            <div class="contact-info">
              ${profile.email ? `<div>📧 ${profile.email}</div>` : ''}
              ${profile.phone ? `<div>📱 ${profile.phone}</div>` : ''}
              ${profile.address ? `<div>📍 ${profile.address}</div>` : ''}
            </div>

            ${profile.skills && profile.skills.length > 0 ? `
              <h3>SKILLS</h3>
              <div class="section-content">
                ${profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            ` : ''}

            ${profile.interests && profile.interests.length > 0 ? `
              <h3>INTERESTS</h3>
              <div class="section-content">
                ${profile.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
              </div>
            ` : ''}

            ${profile.year || profile.branch ? `
              <h3>EDUCATION</h3>
              <div class="section-content">
                ${profile.branch ? `<div class="field"><strong>Branch:</strong> ${profile.branch}</div>` : ''}
                ${profile.year ? `<div class="field"><strong>Year:</strong> ${profile.year}</div>` : ''}
              </div>
            ` : ''}

            ${profile.bio ? `
              <h3>ABOUT</h3>
              <div class="section-content">
                ${profile.bio}
              </div>
            ` : ''}

            ${(profile.projects || []).length > 0 ? `
              <h3>PROJECTS</h3>
              <div class="section-content">
                ${profile.projects.map((p) => `<p><strong>${p.title}</strong> — ${p.description || ''}</p>`).join('')}
              </div>
            ` : ''}

            ${(profile.experience || []).length > 0 ? `
              <h3>EXPERIENCE</h3>
              <div class="section-content">
                ${profile.experience.map((e) => `<p><strong>${e.title}</strong> at ${e.company}</p>`).join('')}
              </div>
            ` : ''}

            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `)
      resumeWindow.document.close()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content resume-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Resume Preview</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body resume-preview">
          <div className="resume-document">
            <h1>{profile.fullName || 'Student Resume'}</h1>
            
            {(profile.email || profile.phone || profile.address) && (
              <div className="resume-section contact-info">
                {profile.email && <p><strong>Email:</strong> {profile.email}</p>}
                {profile.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
                {profile.address && <p><strong>Address:</strong> {profile.address}</p>}
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="resume-section">
                <h3>SKILLS</h3>
                <p>{profile.skills.join(', ')}</p>
              </div>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div className="resume-section">
                <h3>INTERESTS</h3>
                <p>{profile.interests.join(', ')}</p>
              </div>
            )}

            {(profile.year || profile.branch) && (
              <div className="resume-section">
                <h3>EDUCATION</h3>
                {profile.branch && <p><strong>Branch:</strong> {profile.branch}</p>}
                {profile.year && <p><strong>Year:</strong> {profile.year}</p>}
              </div>
            )}

            {profile.bio && (
              <div className="resume-section">
                <h3>ABOUT</h3>
                <p>{profile.bio}</p>
              </div>
            )}

            {(profile.projects || []).length > 0 && (
              <div className="resume-section">
                <h3>PROJECTS</h3>
                {(profile.projects || []).map((p) => (
                  <p key={p.id || p.title}><strong>{p.title}</strong> — {p.description}</p>
                ))}
              </div>
            )}

            {(profile.experience || []).length > 0 && (
              <div className="resume-section">
                <h3>EXPERIENCE</h3>
                {(profile.experience || []).map((e) => (
                  <p key={e.id || e.title}><strong>{e.title}</strong> at {e.company}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
          <button onClick={handleDownloadPDF} className="btn btn-primary">
            <Download size={18} />
            Download as PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResumePreviewModal
