import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/services/firebase/client'
import './Auth.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    await sendPasswordResetEmail(auth, email)
    setMessage('Password reset email sent. Please check your inbox.')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p>Enter your email and we will send a reset link.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            required
          />
          <button type="submit" className="btn btn-primary">Send Reset Link</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        <Link to="/login" className="auth-link">Back to login</Link>
      </div>
    </div>
  )
}

export default ForgotPassword
