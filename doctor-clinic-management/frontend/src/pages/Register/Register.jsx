import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const ROLES = [
  { key: 'patient', label: 'Patient' },
  { key: 'reception', label: 'Receptionist' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'medical_store', label: 'Medical Store' },
  { key: 'admin', label: 'Admin' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const navigate = useNavigate();

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
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = 'Enter a valid phone number';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (role === 'patient') {
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) errors.gender = 'Gender is required';
      if (!formData.address.trim()) errors.address = 'Address is required';
    }
    if (!acceptTerms) errors.terms = 'You must accept the terms and conditions';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      navigate('/login', {
        state: { message: 'Account created successfully! Please sign in.' },
      });
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-illustration">
        <div className="register-illustration-bg" />
        <div className="register-illustration-content">
          <div className="register-brand">
            <span className="register-brand-icon">+C</span>
            <span className="register-brand-name">ClinicManager</span>
          </div>
          <div className="register-illustration-icon">📝</div>
          <h2 className="register-illustration-title">Join Our Healthcare Network</h2>
          <p className="register-illustration-desc">
            Create your account and start managing your clinic operations efficiently.
          </p>
        </div>
      </div>

      <div className="register-form-container">
        <div className="register-form-wrapper">
          <div className="register-form-header">
            <h2 className="register-form-title">Create Account</h2>
            <p className="register-form-subtitle">Fill in the details to get started</p>
          </div>

          <div className="register-role-tabs">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`register-role-tab${role === r.key ? ' active' : ''}`}
                onClick={() => { setRole(r.key); setError(''); setFieldErrors({}); }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {error && <div className="register-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                name="fullName"
                type="text"
                className={`form-input${fieldErrors.fullName ? ' error' : ''}`}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {fieldErrors.fullName && <span className="form-error">{fieldErrors.fullName}</span>}
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className={`form-input${fieldErrors.email ? ' error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className={`form-input${fieldErrors.phone ? ' error' : ''}`}
                  placeholder="Enter your phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {fieldErrors.phone && <span className="form-error">{fieldErrors.phone}</span>}
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className={`form-input${fieldErrors.password ? ' error' : ''}`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  className={`form-input${fieldErrors.confirmPassword ? ' error' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {fieldErrors.confirmPassword && <span className="form-error">{fieldErrors.confirmPassword}</span>}
              </div>
            </div>

            {role === 'patient' && (
              <>
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-dob">Date of Birth</label>
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
                    <label className="form-label" htmlFor="reg-gender">Gender</label>
                    <select
                      id="reg-gender"
                      name="gender"
                      className={`form-input${fieldErrors.gender ? ' error' : ''}`}
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {fieldErrors.gender && <span className="form-error">{fieldErrors.gender}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-address">Address</label>
                  <textarea
                    id="reg-address"
                    name="address"
                    className={`form-input form-textarea${fieldErrors.address ? ' error' : ''}`}
                    placeholder="Enter your address"
                    rows="2"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  {fieldErrors.address && <span className="form-error">{fieldErrors.address}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-blood">Blood Group</label>
                  <select
                    id="reg-blood"
                    name="bloodGroup"
                    className="form-input"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select blood group</option>
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
                  I accept the <a href="/" className="form-link">Terms & Conditions</a> and <a href="/" className="form-link">Privacy Policy</a>
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
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="register-footer-text">
            Already have an account? <Link to="/login" className="form-link">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
