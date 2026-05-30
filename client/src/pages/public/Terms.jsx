import { Link } from 'react-router-dom'
import './Home.css'

const Terms = () => (
  <div className="home">
    <div className="container">
      <div className="page-header">
        <h1>Terms of Service</h1>
        <p>Use this portal responsibly for internship discovery, applications, and review workflows.</p>
      </div>
      <section className="features">
        <p>Accounts must use accurate information. Admin and organization actions should be performed only by authorized users.</p>
        <p>Internship data, applications, and profile details should not be misused or shared outside approved academic workflows.</p>
        <Link to="/register" className="btn btn-primary">Back to Register</Link>
      </section>
    </div>
  </div>
)

export default Terms
