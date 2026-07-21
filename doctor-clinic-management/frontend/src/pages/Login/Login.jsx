import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import Input from '../../components/Forms/Input';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Buttons';
import { HospitalIcon } from '../../components/Brand/Brand';
import './Login.css';

const PATIENT_ROLE = { key: 'patient', labelKey: 'role.patient' };

const STAFF_ROLES = [
  { key: 'doctor', labelKey: 'role.doctor' },
  { key: 'reception', labelKey: 'role.reception' },
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
  const { login, loading, needsPasswordChange, changePassword } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('patient');
  const [staffMode, setStaffMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpError, setCpError] = useState('');

  const selectRole = (key) => {
    setRole(key);
    setStaffMode(STAFF_ROLES.some((r) => r.key === key));
    setError('');
    setFieldErrors({});
  };

  const validate = () => {
    const errors = {};
    const value = email.trim();
    if (!value) errors.email = t('auth.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/^[A-Za-z0-9-]+$/.test(value)) {
      errors.email = t('auth.identifierInvalid');
    }
    if (!password) errors.password = t('auth.passwordRequired');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    try {
      const ok = await login(email, password, role);
      if (!ok) return;
      if (needsPasswordChange) {
        setShowChangeModal(true);
        return;
      }
      const routeRole = role === 'medical_store' ? 'medical-store' : role;
      const from = location.state?.from?.pathname || `/${routeRole}/dashboard`;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setCpError('');
    if (cpNew !== cpConfirm) {
      setCpError(t('passwordsMismatch'));
      return;
    }
    const ok = await changePassword(cpCurrent, cpNew);
    if (ok) {
      const routeRole = role === 'medical_store' ? 'medical-store' : role;
      const from = location.state?.from?.pathname || `/${routeRole}/dashboard`;
      navigate(from, { replace: true });
    } else {
      setCpError(error || t('auth.invalidCredentials'));
    }
  };

  const creds = DEMO_CREDENTIALS[role];

  return (
      <div className="login-page">
        <button className="login-home" aria-label={t('nav.home')} onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5 12 3l9 6.5" />
            <path d="M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10" />
          </svg>
        </button>
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

            <div className="login-role-tabs">
              {(staffMode ? STAFF_ROLES : [PATIENT_ROLE]).map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={`login-role-tab${role === r.key ? ' active' : ''}`}
                  onClick={() => selectRole(r.key)}
                >
                  {t(r.labelKey)}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="login-staff-toggle"
              onClick={() => {
                if (staffMode) {
                  selectRole('patient');
                } else {
                  setStaffMode(true);
                  setRole('doctor');
                  setError('');
                  setFieldErrors({});
                }
              }}
            >
              {staffMode ? t('auth.backToPatientLogin') : t('auth.staffLogin')}
            </button>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">{t('auth.emailOrId')}</label>
                <input
                  id="login-email"
                  type="text"
                  className={`form-input${fieldErrors.email ? ' error' : ''}`}
                  placeholder={`mail / ${t('auth.idExample.' + role)}`}
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

            {!staffMode && (
              <div className="login-footer-text">
                {t('auth.noAccount')} <Link to="/register" className="form-link">{t('auth.register')}</Link>
              </div>
            )}

            <div className="login-demo-hint">
              {t('auth.demo')}: {creds.email} / {creds.password}
            </div>
          </div>
        </div>

        {showChangeModal && (
          <Modal isOpen={showChangeModal} title={t('changeDefault')} closeOnOverlay={false}>
            <div className="staff-form">
              <p className="cred-note">{t('mustChangePassword')}</p>
              <Input
                label={t('currentPassword')}
                type="password"
                value={cpCurrent}
                onChange={(e) => setCpCurrent(e.target.value)}
                placeholder={DEFAULT_HINT[role] || ''}
              />
              <Input
                label={t('newPassword')}
                type="password"
                value={cpNew}
                onChange={(e) => setCpNew(e.target.value)}
              />
              <Input
                label={t('confirmPassword')}
                type="password"
                value={cpConfirm}
                onChange={(e) => setCpConfirm(e.target.value)}
              />
              {cpError && <div className="login-error">{cpError}</div>}
              <div className="staff-form-actions">
                <Button onClick={handleChangePassword}>{t('changeDefault')}</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
  );
}

const DEFAULT_HINT = {
  doctor: 'doctor@1234',
  reception: 'reception@1234',
  medical_store: 'medical_store@1234',
  admin: 'admin@1234',
};
