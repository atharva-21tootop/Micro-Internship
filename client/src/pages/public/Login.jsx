import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import './Auth.css'
import { ROUTES } from '@/config/routes'
import OAuthButtons from '@/components/auth/OAuthButtons'
import {
  loginWithEmail,
  signInWithGoogle,
  signInWithGithub,
  completeOAuthSignIn,
  getOAuthErrorMessage,
} from '@/services/authService'
import { getUser } from '@/services/userService'
import { redirectByRole } from '@/utils/authRedirect'
import { markOnboardingPending } from '@/hooks/useOnboarding'

const Login = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const finishAuth = (userData, isNewUser) => {
    if (isNewUser) {
      markOnboardingPending(userData.role)
    }
    redirectByRole(navigate, userData)
  }

  const handleOAuth = async (provider) => {
    setError('')
    setOauthLoading(provider)
    try {
      const credential =
        provider === 'google' ? await signInWithGoogle() : await signInWithGithub()
      const { profile, isNewUser } = await completeOAuthSignIn(credential.user, {
        isRegistration: false,
        provider,
      })
      finishAuth(profile, isNewUser)
    } catch (err) {
      console.error(err)
      setError(getOAuthErrorMessage(err))
    } finally {
      setOauthLoading(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { email, password } = formData

    try {
      const userCredential = await loginWithEmail({ email, password })
      const uid = userCredential.user.uid
      const userData = await getUser(uid)

      if (!userData) {
        throw new Error('User record missing in database')
      }

      finishAuth(userData, false)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Login failed!')
    } finally {
      setIsLoading(false)
    }
  }

  const busy = isLoading || !!oauthLoading

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <CheckCircle className="logo-icon" />
              <span>MITAOE Micro Internship Portal</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <OAuthButtons
            onGoogle={() => handleOAuth('google')}
            onGithub={() => handleOAuth('github')}
            loadingProvider={oauthLoading}
            disabled={busy}
          />

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <p className="error-msg">{error}</p>}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-group">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={busy}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{' '}
              <Link to={ROUTES.register} className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-info">
          <h2>Join Thousands of Students</h2>
          <p>
            Discover micro internships that fit your schedule and help you build real-world skills for
            your career.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Flexible scheduling</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Real-world experience</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Industry mentorship</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
