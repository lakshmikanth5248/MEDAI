import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    admin: 'Administrator',
    reception: 'Receptionist',
    doctor: 'Doctor',
    patient: 'Patient',
    medical_store: 'Medical Store',
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">Clinic Management System</h2>
      </div>
      <div className="navbar-right">
        <button className="navbar-notification" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="navbar-notification-dot" />
        </button>
        <div className="navbar-user" ref={dropdownRef}>
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
                {roleLabel[user?.role] || user?.role}
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
                Profile Settings
              </button>
              <div className="navbar-dropdown-divider" />
              <button className="navbar-dropdown-item logout" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
