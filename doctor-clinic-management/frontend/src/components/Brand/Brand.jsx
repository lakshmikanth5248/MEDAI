import { Link } from 'react-router-dom';

export function HospitalIcon({ className, size = 22 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      <path d="M12 7v6" />
      <path d="M9 10h6" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}

export function BrandLogo({ to = '/', iconClassName = '', textClassName = 'brand-text', text = 'ClinicManager' }) {
  return (
    <Link to={to} className="brand-logo">
      <span className={`brand-logo-icon ${iconClassName}`}>
        <HospitalIcon />
      </span>
      <span className={textClassName}>{text}</span>
    </Link>
  );
}
