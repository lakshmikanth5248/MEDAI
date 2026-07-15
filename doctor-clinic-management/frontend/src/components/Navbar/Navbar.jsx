import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { Modal } from '../Modal';
import { patients, doctors, users, medicalStores } from '../../utils/mockData';
import './Navbar.css';

const SCOPE_RULES = [
  { test: (p) => p.includes('patients'), scope: 'patient', placeholderKey: 'nav.searchPatients' },
  { test: (p) => p.includes('doctors'), scope: 'doctor', placeholderKey: 'nav.searchDoctors' },
  { test: (p) => p.includes('medical-store') || p.includes('inventory'), scope: 'store', placeholderKey: 'nav.searchStores' },
  { test: (p) => p.includes('/users'), scope: 'user', placeholderKey: 'nav.searchUsers' },
];

function getScope(pathname) {
  const hit = SCOPE_RULES.find((r) => r.test(pathname));
  return hit || { scope: 'all', placeholderKey: 'nav.searchPlaceholderAll' };
}

const buildIndex = (t) => [
  ...patients.map((p) => ({
    type: t('role.patient'),
    typeKey: 'patient',
    id: p.patientId,
    name: p.name,
    sub: `${p.gender} · ${p.bloodGroup || ''}`,
    record: p,
  })),
  ...doctors.map((d) => ({
    type: t('role.doctor'),
    typeKey: 'doctor',
    id: d.doctorId,
    name: d.name,
    sub: d.specialization,
    record: d,
  })),
  ...users.map((u) => ({
    type: t(`role.${u.role}`) || u.role,
    typeKey: 'user',
    id: u.id,
    name: u.name,
    sub: u.email,
    record: u,
  })),
  ...medicalStores.map((s) => ({
    type: t('role.medical_store'),
    typeKey: 'store',
    id: s.storeCode,
    name: s.name,
    sub: s.address,
    record: s,
  })),
];

const formatValue = (val) => {
  if (val === null || val === undefined || val === '') return '—';
  if (Array.isArray(val)) return val.length ? val.join(', ') : '—';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(null);
  const userRef = useRef(null);
  const searchRef = useRef(null);

  const index = useMemo(() => buildIndex(t), [t]);
  const { scope, placeholderKey } = getScope(pathname);
  const placeholder = t(placeholderKey);
  const scopedIndex = useMemo(
    () => (scope === 'all' ? index : index.filter((i) => i.typeKey === scope)),
    [index, scope]
  );

  useEffect(() => {
    function handleClick(e) {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function handleSearchClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleSearchClick);
    return () => document.removeEventListener('mousedown', handleSearchClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return scopedIndex
      .filter(
        (item) =>
          item.id.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, scopedIndex]);

  const showDropdown = focused && query.trim().length > 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openDetails = (item) => {
    setSelected(item);
    setFocused(false);
    setQuery('');
  };

  const goToNotifications = () => {
    const prefix = user?.role === 'medical_store' ? 'medical-store' : user?.role;
    navigate(`/${prefix}/notifications`);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">{t('nav.appName')}</h2>
      </div>

      <div className="navbar-search" ref={searchRef}>
        <svg className="navbar-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="navbar-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
        />
        {showDropdown && (
          <div className="navbar-search-results">
            {results.length === 0 ? (
              <div className="navbar-search-empty">{t('nav.noRecords')} "{query}"</div>
            ) : (
              results.map((item) => (
                <button
                  key={`${item.typeKey}-${item.id}`}
                  className="navbar-search-item"
                  onClick={() => openDetails(item)}
                >
                  <span className={`search-badge search-badge-${item.typeKey}`}>{item.type}</span>
                  <span className="navbar-search-item-main">
                    <span className="navbar-search-item-name">{item.name}</span>
                    <span className="navbar-search-item-sub">{item.sub}</span>
                  </span>
                  <span className="navbar-search-item-id">{item.id}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        <LanguageSwitcher />
        <button className="navbar-notification" aria-label={t('nav.notifications')} onClick={goToNotifications}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="navbar-notification-dot" />
        </button>
        <div className="navbar-user" ref={userRef}>
          <button
            className="navbar-user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="navbar-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="navbar-user-info">
              <span className="navbar-user-name">{user?.name || 'User'}</span>
              <span className="navbar-user-role">
                {t(`role.${user?.role}`) || user?.role}
              </span>
            </div>
            <svg
              className={`navbar-chevron ${dropdownOpen ? 'open' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-header">
                <span className="navbar-dropdown-name">{user?.name}</span>
                <span className="navbar-dropdown-email">{user?.email}</span>
              </div>
              <div className="navbar-dropdown-divider" />
              <button
                className="navbar-dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  const profilePath = `/${user?.role === 'medical_store' ? 'medical-store' : user?.role}/profile`;
                  navigate(profilePath);
                }}
              >
                {t('nav.profileSettings')}
              </button>
              <div className="navbar-dropdown-divider" />
              <button className="navbar-dropdown-item logout" onClick={handleLogout}>
                {t('nav.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.type} Details` : ''}
        size="md"
      >
        {selected && (
          <div className="search-detail">
            <div className="search-detail-header">
              <span className={`search-badge search-badge-${selected.typeKey}`}>{selected.type}</span>
              <span className="search-detail-id">{selected.id}</span>
            </div>
            <dl className="search-detail-list">
              {Object.entries(selected.record)
                .filter(([, v]) => v !== null && v !== undefined && typeof v !== 'function')
                .map(([k, v]) => (
                  <div className="search-detail-row" key={k}>
                    <dt>{k}</dt>
                    <dd>{formatValue(v)}</dd>
                  </div>
                ))}
            </dl>
          </div>
        )}
      </Modal>
    </header>
  );
}
