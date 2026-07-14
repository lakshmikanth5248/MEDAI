import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const ROLES = [
  { key: 'patient', label: 'Patient' },
  { key: 'reception', label: 'Receptionist' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'medical_store', label: 'Medical Store' },
  { key: 'admin', label: 'Admin' },
];

const DEMO_CREDENTIALS = {
  admin: { email: 'admin@clinic.com', password: 'admin123' },
  reception: { email: 'reception@clinic.com', password: 'reception123' },
  doctor: { email: 'doctor@clinic.com', password: 'doctor123' },
  patient: { email: 'patient@clinic.com', password: 'patient123' },
  medical_store: { email: 'store@clinic.com', password: 'store123' },
};

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    try {
      await login(email, password, role);
      const routeRole = role === 'medical_store' ? 'medical-store' : role;
      const from = location.state?.from?.pathname || `/${routeRole}/dashboard`;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const creds = DEMO_CREDENTIALS[role];

  return (
    <div className="login-page">
      <div className="login-illustration">
        <div className="login-illustration-bg" />
        <div className="login-illustration-content">
          <div className="login-brand">
            <span className="login-brand-icon">+C</span>
            <span className="login-brand-name">ClinicManager</span>
          </div>
          <div className="login-illustration-icon">✚</div>
          <h2 className="login-illustration-title">Complete Clinic Management Solution</h2>
          <p className="login-illustration-desc">
            Streamline your clinic operations with digital appointments, prescriptions, medical records, and more.
          </p>
        </div>
      </div>

      <div className="login-form-container">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2 className="login-form-title">Welcome Back</h2>
            <p className="login-form-subtitle">Sign in to your account to continue</p>
          </div>

          <div className="login-role-tabs">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`login-role-tab${role === r.key ? ' active' : ''}`}
                onClick={() => { setRole(r.key); setError(''); setFieldErrors({}); }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className={`form-input${fieldErrors.email ? ' error' : ''}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className={`form-input${fieldErrors.password ? ' error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
            </div>

            <div className="form-row">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="form-link">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer-text">
            Don't have an account? <Link to="/register" className="form-link">Register</Link>
          </div>

          <div className="login-demo-hint">
            Demo: {creds.email} / {creds.password}
          </div>
        </div>
      </div>
    </div>
  );
}
