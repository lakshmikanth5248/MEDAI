import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import Input from '../../components/Forms/Input';
import { HospitalIcon } from '../../components/Brand/Brand';
import './Register.css';

const ROLES = [
  { key: 'patient', labelKey: 'role.patient' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    dateOfBirth: '', gender: '', address: '', bloodGroup: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = t('register.fullNameRequired');
    if (!formData.email.trim()) errors.email = t('auth.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = t('auth.emailInvalid');
    if (!formData.phone.trim()) errors.phone = t('register.phoneRequired');
    else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = t('register.phoneInvalid');
    if (!formData.password) errors.password = t('auth.passwordRequired');
    else if (formData.password.length < 6) errors.password = t('register.passwordMin');
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = t('register.passwordsMismatch');
    if (role === 'patient') {
      if (!formData.dateOfBirth) errors.dateOfBirth = t('register.dobRequired');
      if (!formData.gender) errors.gender = t('register.genderRequired');
      if (!formData.address.trim()) errors.address = t('register.addressRequired');
    }
    if (!acceptTerms) errors.terms = t('register.acceptTermsRequired');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const ok = await register({
        email: formData.email,
        password: formData.password,
        role,
        fullName: formData.fullName,
      });
      if (ok) {
        navigate('/login', {
          state: { message: t('register.success') },
        });
        return;
      }
    } catch {
      /* fall through to error */
    }
    setError(authError || 'Registration failed. Please try again.');
    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-illustration">
        <div className="register-illustration-bg" />
        <div className="register-illustration-content">
          <div className="register-brand">
            <span className="register-brand-icon"><HospitalIcon /></span>
            <span className="register-brand-name">ClinicManager</span>
          </div>
          <div className="register-illustration-icon">📝</div>
          <h2 className="register-illustration-title">{t('register.joinTitle')}</h2>
          <p className="register-illustration-desc">
            {t('register.joinDesc')}
          </p>
        </div>
      </div>

      <div className="register-form-container">
        <div className="register-form-wrapper">
          <div className="register-form-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 className="register-form-title">{t('register.title')}</h2>
                <p className="register-form-subtitle">{t('register.subtitle')}</p>
              </div>
              <Link to="/" className="register-back-btn" title={t('register.back')}>← {t('register.back')}</Link>
            </div>
          </div>

          {ROLES.length > 1 && (
            <div className="register-role-tabs">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={`register-role-tab${role === r.key ? ' active' : ''}`}
                  onClick={() => { setRole(r.key); setError(''); setFieldErrors({}); }}
                >
                  {t(r.labelKey)}
                </button>
              ))}
            </div>
          )}

          {error && <div className="register-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">{t('register.fullName')}</label>
              <input
                id="reg-name"
                name="fullName"
                type="text"
                className={`form-input${fieldErrors.fullName ? ' error' : ''}`}
                placeholder={t('register.fullNamePlaceholder')}
                value={formData.fullName}
                onChange={handleChange}
              />
              {fieldErrors.fullName && <span className="form-error">{fieldErrors.fullName}</span>}
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">{t('auth.email')}</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className={`form-input${fieldErrors.email ? ' error' : ''}`}
                  placeholder={t('auth.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">{t('register.phone')}</label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className={`form-input${fieldErrors.phone ? ' error' : ''}`}
                  placeholder={t('register.phonePlaceholder')}
                  value={formData.phone}
                  onChange={handleChange}
                />
                {fieldErrors.phone && <span className="form-error">{fieldErrors.phone}</span>}
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <Input
                  type="password"
                  label={t('register.createPassword')}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  placeholder={t('register.createPassword')}
                />
              </div>
              <div className="form-group">
                <Input
                  type="password"
                  label={t('auth.confirmPassword')}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={fieldErrors.confirmPassword}
                  placeholder={t('register.confirmPasswordPlaceholder')}
                />
              </div>
            </div>

            {role === 'patient' && (
              <>
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-dob">{t('register.dateOfBirth')}</label>
                    <input
                      id="reg-dob"
                      name="dateOfBirth"
                      type="date"
                      className={`form-input${fieldErrors.dateOfBirth ? ' error' : ''}`}
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                    {fieldErrors.dateOfBirth && <span className="form-error">{fieldErrors.dateOfBirth}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-gender">{t('register.gender')}</label>
                    <select
                      id="reg-gender"
                      name="gender"
                      className={`form-input${fieldErrors.gender ? ' error' : ''}`}
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">{t('register.selectGender')}</option>
                      <option value="male">{t('register.male')}</option>
                      <option value="female">{t('register.female')}</option>
                      <option value="other">{t('register.other')}</option>
                    </select>
                    {fieldErrors.gender && <span className="form-error">{fieldErrors.gender}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-address">{t('register.address')}</label>
                  <textarea
                    id="reg-address"
                    name="address"
                    className={`form-input form-textarea${fieldErrors.address ? ' error' : ''}`}
                    placeholder={t('register.addressPlaceholder')}
                    rows="2"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  {fieldErrors.address && <span className="form-error">{fieldErrors.address}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-blood">{t('register.bloodGroup')}</label>
                  <select
                    id="reg-blood"
                    name="bloodGroup"
                    className="form-input"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">{t('register.selectBloodGroup')}</option>
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span>
                  {t('register.acceptTerms')}
                </span>
              </label>
              {fieldErrors.terms && <span className="form-error">{fieldErrors.terms}</span>}
            </div>

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  {t('register.creating')}
                </span>
              ) : (
                t('register.title')
              )}
            </button>
          </form>

          <div className="register-footer-text">
            {t('register.haveAccount')} <Link to="/login" className="form-link">{t('auth.signIn')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
