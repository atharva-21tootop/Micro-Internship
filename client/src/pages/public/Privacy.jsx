import { Link } from 'react-router-dom'
import './Home.css'

const Privacy = () => (
  <div className="home">
    <div className="container">
      <div className="page-header">
        <h1>Privacy Policy</h1>
        <p>The portal stores profile, application, notification, and internship data in Firebase.</p>
      </div>
      <section className="features">
        <p>Only authenticated users should access protected data. Admins and organizations can view information needed for approvals and applications.</p>
        <p>Do not upload private documents unless they are required for internship workflows.</p>
        <Link to="/register" className="btn btn-primary">Back to Register</Link>
      </section>
    </div>
  </div>
)

export default Privacy
