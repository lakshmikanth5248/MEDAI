import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '../../components/Forms';
import * as authApi from '../../services/api/auth';
import { getErrorMessage } from '../../services/apiError';
import { useTranslation } from '../../i18n/LanguageContext';
import { HospitalIcon } from '../../components/Brand/Brand';
import '../ForgotPassword/ForgotPassword.css';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const err = {};
    if (!password) err.password = t('auth.passwordRequired');
    else if (password.length < 6) err.password = t('register.passwordMin');
    if (!confirm) err.confirm = t('reset.confirmRequired');
    else if (password !== confirm) err.confirm = t('register.passwordsMismatch');
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setErrors({ confirm: getErrorMessage(err, t('reset.unableUpdate')) });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="forgot-page">
        <div className="forgot-card">
          <Link to="/" className="forgot-logo">
            <span className="forgot-logo-icon"><HospitalIcon /></span>
            <span className="forgot-logo-text">ClinicManager</span>
          </Link>
          <div className="forgot-error" style={{ textAlign: 'center' }}>
            {t('forgot.invalidMissing')}
          </div>
          <div className="forgot-back">
            <Link to="/forgot-password" className="form-link">← {t('forgot.title')}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="forgot-page">
        <div className="forgot-card">
          <Link to="/" className="forgot-logo">
            <span className="forgot-logo-icon"><HospitalIcon /></span>
            <span className="forgot-logo-text">ClinicManager</span>
          </Link>
          <div className="forgot-success">
            <div className="forgot-success-icon">✅</div>
            <h2 className="forgot-title">{t('reset.passwordUpdated')}</h2>
            <p className="forgot-desc">
              {t('reset.passwordUpdatedDesc')}
            </p>
          </div>
          <div className="forgot-back">
            <Link to="/login" className="forgot-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              {t('reset.goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <Link to="/" className="forgot-logo">
          <span className="forgot-logo-icon"><HospitalIcon /></span>
          <span className="forgot-logo-text">ClinicManager</span>
        </Link>

        <div className="forgot-header">
          <div className="forgot-icon">🔑</div>
          <h2 className="forgot-title">{t('reset.title')}</h2>
          <p className="forgot-desc">
            {t('reset.desc')}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reset-password">{t('reset.newPassword')}</label>
            <Input
              id="reset-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
              error={errors.password}
              placeholder={t('reset.newPasswordPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-confirm">{t('reset.confirmPassword')}</label>
            <Input
              id="reset-confirm"
              name="confirm"
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }}
              error={errors.confirm}
              placeholder={t('reset.confirmPasswordPlaceholder')}
            />
          </div>

          <button type="submit" className="forgot-submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading"><span className="spinner" />{t('reset.updating')}</span>
            ) : (
              t('reset.submit')
            )}
          </button>
        </form>

        <div className="forgot-back">
          <Link to="/login" className="form-link">← {t('forgot.backToLogin')}</Link>
        </div>
      </div>
    </div>
  );
}
