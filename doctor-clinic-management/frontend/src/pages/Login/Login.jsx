import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import { HospitalIcon } from '../../components/Brand/Brand';
import './Login.css';

export default function Login() {
  const { login, loading, error: authError, clearError } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const validate = () => {
    const errors = {};
    const value = email.trim();
    if (!value) errors.email = t('auth.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.email = t('auth.emailInvalid');
    }
    if (!password) errors.password = t('auth.passwordRequired');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    const success = await login(email, password);
    if (!success) {
      setError(authError || t('auth.invalidCredentials'));
      return;
    }
  };

  return (
    <div className="login-page">
      <div className="login-illustration">
        <div className="login-illustration-bg" />
        <div className="login-illustration-content">
          <div className="login-brand">
            <span className="login-brand-icon"><HospitalIcon /></span>
            <span className="login-brand-name">ClinicManager</span>
          </div>
          <div className="login-illustration-icon">✚</div>
          <h2 className="login-illustration-title">{t('auth.solutionTitle')}</h2>
          <p className="login-illustration-desc">
            {t('auth.solutionDesc')}
          </p>
        </div>
      </div>

      <div className="login-form-container">
        <div className="login-form-wrapper">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <LanguageSwitcher />
          </div>
          <div className="login-form-header">
            <h2 className="login-form-title">{t('auth.welcomeBack')}</h2>
            <p className="login-form-subtitle">{t('auth.signInSubtitle')}</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">{t('auth.email')}</label>
              <input
                id="login-email"
                type="email"
                className={`form-input${fieldErrors.email ? ' error' : ''}`}
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); setFieldErrors({}); }}
                autoComplete="email"
              />
              {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">{t('auth.password')}</label>
              <input
                id="login-password"
                type="password"
                className={`form-input${fieldErrors.password ? ' error' : ''}`}
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); setFieldErrors({}); }}
                autoComplete="current-password"
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
                <span>{t('auth.rememberMe')}</span>
              </label>
              <Link to="/forgot-password" className="form-link">{t('auth.forgotPassword')}</Link>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  {t('auth.signingIn')}
                </span>
              ) : (
                t('auth.signIn')
              )}
            </button>
          </form>

          <div className="login-footer-text">
            {t('auth.noAccount')} <Link to="/register" className="form-link">{t('auth.register')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
