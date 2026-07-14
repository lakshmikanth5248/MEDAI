import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-gray-50)',
      padding: '40px 20px',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '120px', color: 'var(--color-sky-blue)', margin: 0, lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '24px', color: 'var(--color-navy)', margin: '16px 0 8px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--color-gray-500)', marginBottom: '24px', maxWidth: '400px' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        style={{
          padding: '12px 32px',
          background: 'var(--color-sky-blue)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          transition: 'opacity 0.2s',
        }}
      >
        Go to Home
      </Link>
    </div>
  );
}
