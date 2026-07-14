import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setFieldError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Invalid email format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <Link to="/" className="forgot-logo">
          <span className="forgot-logo-icon">+C</span>
          <span className="forgot-logo-text">ClinicManager</span>
        </Link>

        {!sent ? (
          <>
            <div className="forgot-header">
              <div className="forgot-icon">🔒</div>
              <h2 className="forgot-title">Forgot Password?</h2>
              <p className="forgot-desc">
                Enter your registered email address and we'll send you a reset link.
              </p>
            </div>

            {error && <div className="forgot-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  className={`form-input${fieldError ? ' error' : ''}`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldError(''); }}
                />
                {fieldError && <span className="form-error">{fieldError}</span>}
              </div>

              <button
                type="submit"
                className="forgot-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="forgot-success">
            <div className="forgot-success-icon">✉️</div>
            <h2 className="forgot-title">Check Your Email</h2>
            <p className="forgot-desc">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
            </p>
            <p className="forgot-desc" style={{ marginTop: 8, fontSize: 13, color: 'var(--color-gray-400)' }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                type="button"
                className="forgot-resend"
                onClick={() => setSent(false)}
              >
                try again
              </button>
            </p>
          </div>
        )}

        <div className="forgot-back">
          <Link to="/login" className="form-link">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
