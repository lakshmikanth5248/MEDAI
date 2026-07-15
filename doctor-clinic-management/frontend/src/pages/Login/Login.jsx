import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import Input from '../../components/Forms/Input';
import './Login.css';

const ROLES = [
  { key: 'patient', labelKey: 'role.patient' },
  { key: 'reception', labelKey: 'role.reception' },
  { key: 'doctor', labelKey: 'role.doctor' },
  { key: 'medical_store', labelKey: 'role.medical_store' },
  { key: 'admin', labelKey: 'role.admin' },
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
  const { t } = useTranslation();
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
    if (!email.trim()) errors.email = t('auth.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t('auth.emailInvalid');
    if (!password) errors.password = t('auth.passwordRequired');
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

            <div className="login-role-tabs">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={`login-role-tab${role === r.key ? ' active' : ''}`}
                  onClick={() => { setRole(r.key); setError(''); setFieldErrors({}); }}
                >
                  {t(r.labelKey)}
                </button>
              ))}
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
                  onChange={(e) => setEmail(e.target.value)}
                />
                {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
              </div>

              <Input
                type="password"
                label={t('auth.password')}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                placeholder={t('auth.passwordPlaceholder')}
              />

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

            <div className="login-demo-hint">
              {t('auth.demo')}: {creds.email} / {creds.password}
            </div>
          </div>
        </div>
      </div>
  );
}
