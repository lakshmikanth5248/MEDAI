import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findUserByEmail, encodeResetToken } from '../../services/userStore';
import { useTranslation } from '../../i18n/LanguageContext';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setFieldError(t('auth.emailRequired'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(t('auth.emailInvalid'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    if (!validate()) return;
    const registered = findUserByEmail(email);
    if (!registered) {
      setFieldError(t('forgot.noAccountFound'));
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const token = encodeResetToken(email);
      setResetUrl(`${window.location.origin}/reset-password?token=${encodeURIComponent(token)}`);
      setSent(true);
    } catch {
      setError(t('auth.errorOccurred'));
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
              <h2 className="forgot-title">{t('forgot.title')}</h2>
              <p className="forgot-desc">
                {t('forgot.desc')}
              </p>
            </div>

            {error && <div className="forgot-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">{t('auth.email')}</label>
                <input
                  id="forgot-email"
                  type="email"
                  className={`form-input${fieldError ? ' error' : ''}`}
                  placeholder={t('auth.emailPlaceholder')}
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
                    {t('auth.sending')}
                  </span>
                ) : (
                  t('auth.sendResetLink')
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="forgot-success">
            <div className="forgot-success-icon">✉️</div>
            <h2 className="forgot-title">{t('forgot.emailSentTitle')}</h2>
            <p className="forgot-desc">
              {t('forgot.emailSentDesc')} <strong>{email}</strong> {t('forgot.emailSentDesc2')}
            </p>
            {resetUrl && (
              <div className="forgot-reset-link">
                <a href={resetUrl} target="_blank" rel="noopener noreferrer" className="forgot-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  {t('forgot.changePassword')}
                </a>
                <p className="forgot-desc" style={{ marginTop: 8, fontSize: 12, wordBreak: 'break-all', color: 'var(--color-gray-400)' }}>
                  {t('forgot.sentNote')} <strong>{email}</strong>. {t('forgot.emailSentDesc2')}
                </p>
              </div>
            )}
            <p className="forgot-desc" style={{ marginTop: 8, fontSize: 13, color: 'var(--color-gray-400)' }}>
              {t('forgot.notReceived')}{' '}
              <button
                type="button"
                className="forgot-resend"
                onClick={() => setSent(false)}
              >
                {t('forgot.tryAgain')}
              </button>
            </p>
          </div>
        )}

        <div className="forgot-back">
          <Link to="/login" className="form-link">
            ← {t('forgot.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
