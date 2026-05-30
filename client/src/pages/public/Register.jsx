import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import './Auth.css'
import {
  signupWithEmail,
  signInWithGoogle,
  signInWithGithub,
  completeOAuthSignIn,
  getOAuthErrorMessage,
} from '@/services/authService'
import { createOrUpdateUser } from '@/services/userService'
import { validateRegisterForm } from '@/utils/validators'
import { ROUTES } from '@/config/routes'
import { markOnboardingPending } from '@/hooks/useOnboarding'
import { redirectByRole } from '@/utils/authRedirect'
import OAuthButtons from '@/components/auth/OAuthButtons'

const Register = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    companyName: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      })
    }
  }

  const handleOAuth = async (provider) => {
    setError('')
    setSuccess('')
    setOauthLoading(provider)

    try {
      const credential =
        provider === 'google' ? await signInWithGoogle() : await signInWithGithub()
      const { profile, isNewUser } = await completeOAuthSignIn(credential.user, {
        role: formData.role,
        companyName: formData.companyName,
        isRegistration: true,
        provider,
      })

      if (!isNewUser) {
        redirectByRole(navigate, profile)
        return
      }

      markOnboardingPending(formData.role)
      setSuccess('Account created successfully!')
      setTimeout(() => redirectByRole(navigate, profile), 800)
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
    setErrors({})
    setSuccess('')

    const validation = validateRegisterForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setIsLoading(true)

    try {
      const { firstName, lastName, email, phone, password } = formData

      const userCredential = await signupWithEmail({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      })

      const uid = userCredential.user.uid

      const userData = {
        uid,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        phone,
        role: formData.role,
        createdAt: new Date().toISOString(),
      }

      if (formData.role === 'organization') {
        userData.companyName = formData.companyName || `${firstName} ${lastName}`
      }

      await createOrUpdateUser(uid, userData)

      markOnboardingPending(formData.role)

      setSuccess('Account created successfully!')

      if (formData.role === 'organization') {
        setTimeout(() => navigate(ROUTES.organization.overview), 1000)
      } else {
        setTimeout(() => navigate(ROUTES.student.browse), 1000)
      }
    } catch (err) {
      console.error(err)
      setError(err.message)
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
            <h1>Create Account</h1>
            <p>Join our community and start your internship journey</p>
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="input-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input form-input-no-icon"
                required
              >
                <option value="student">Student</option>
                <option value="organization">Organization</option>
              </select>
            </div>
          </div>

          {formData.role === 'organization' && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div className="input-group">
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="form-input form-input-no-icon"
                  placeholder="Enter your company name"
                />
              </div>
            </div>
          )}

          <OAuthButtons
            onGoogle={() => handleOAuth('google')}
            onGithub={() => handleOAuth('github')}
            loadingProvider={oauthLoading}
            disabled={busy}
          />

          <div className="auth-divider">
            <span>or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <div className="input-group">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input form-input-no-icon"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <div className="input-group">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input form-input-no-icon"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input form-input-no-icon"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input form-input-no-icon"
                  placeholder="Enter your phone number"
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
                  placeholder="Create a password"
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <Lock size={20} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="auth-link">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="auth-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={busy}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to={ROUTES.login} className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-info">
          <h2>Start Your Career Journey</h2>
          <p>
            Join our platform and discover micro internships that will help you build the skills you
            need for your dream career.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Personalized recommendations</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Track your progress</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Build your portfolio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
