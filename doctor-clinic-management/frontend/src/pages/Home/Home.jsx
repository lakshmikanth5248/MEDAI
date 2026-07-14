import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const FEATURES = [
  { icon: '✚', title: 'Online Appointments', desc: 'Book appointments 24/7 with real-time slot availability across all departments.' },
  { icon: '📋', title: 'Digital Prescriptions', desc: 'Generate and manage e-prescriptions with automatic drug interaction checks.' },
  { icon: '💊', title: 'Pharmacy Integration', desc: 'Seamless connection with in-house pharmacy for instant medicine dispensing.' },
  { icon: '📄', title: 'Medical Records', desc: 'Secure digital storage of patient history, lab reports, and treatment plans.' },
  { icon: '✉️', title: 'SMS Reminders', desc: 'Automated appointment reminders and health tips via SMS notifications.' },
  { icon: '📊', title: 'Reports & Analytics', desc: 'Comprehensive insights with customizable reports and performance dashboards.' },
];

const STATS = [
  { label: 'Patients Treated', value: 5000, suffix: '+' },
  { label: 'Qualified Doctors', value: 50, suffix: '+' },
  { label: 'Departments', value: 10, suffix: '+' },
  { label: 'Satisfaction Rate', value: 98, suffix: '%' },
];

const STEPS = [
  { step: '01', title: 'Register', desc: 'Create your account in under 2 minutes' },
  { step: '02', title: 'Book Appointment', desc: 'Choose a doctor and pick a time slot' },
  { step: '03', title: 'Visit Doctor', desc: 'Get expert consultation and diagnosis' },
  { step: '04', title: 'Get Treatment', desc: 'Receive prescriptions and follow-up care' },
];

function AnimatedStat({ value, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="stat-card" ref={ref}>
      <span className="stat-value">{count.toLocaleString()}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <div className="home-header-inner">
          <Link to="/" className="home-logo">
            <span className="home-logo-icon">+C</span>
            <span className="home-logo-text">ClinicManager</span>
          </Link>
          <nav className="home-nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <Link to="/login" className="home-nav-login">Sign In</Link>
            <Link to="/register" className="home-nav-register">Get Started</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="hero-badge">Trusted by 5000+ patients</span>
          <h1 className="hero-title">Your Health,<br />Our Priority</h1>
          <p className="hero-subtitle">
            A complete clinic management solution that streamlines appointments,
            medical records, prescriptions, and pharmacy operations — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <a href="#features" className="btn btn-secondary">Learn More</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-illustration">
            <div className="hero-circle hero-circle-1" />
            <div className="hero-circle hero-circle-2" />
            <div className="hero-circle hero-circle-3" />
            <div className="hero-icon-large">✚</div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-desc">
            Powerful tools designed to streamline your clinic operations and enhance patient care.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon" style={{ background: `var(--feature-color-${i + 1})` }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stats">
        <div className="stats-overlay" />
        <div className="stats-inner">
          <div className="section-header light">
            <span className="section-tag">Our Impact</span>
            <h2 className="section-title">By the Numbers</h2>
          </div>
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <AnimatedStat key={i} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">Four Simple Steps</h2>
          <p className="section-desc">
            Getting started with ClinicManager is quick and easy.
          </p>
        </div>
        <div className="steps-row">
          {STEPS.map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-number">{s.step}</div>
              <div className="step-connector" />
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Clinic?</h2>
          <p className="cta-desc">
            Join thousands of healthcare providers who trust ClinicManager.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">Start Free Trial</Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <span className="home-logo-icon">+C</span>
            <span className="home-logo-text">ClinicManager</span>
            <p className="home-footer-desc">
              Complete clinic management solution for modern healthcare providers.
            </p>
          </div>
          <div className="home-footer-links">
            <div className="home-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
            </div>
            <div className="home-footer-col">
              <h4>Company</h4>
              <a href="/">About Us</a>
              <a href="/">Careers</a>
              <a href="/">Contact</a>
            </div>
            <div className="home-footer-col">
              <h4>Legal</h4>
              <a href="/">Privacy Policy</a>
              <a href="/">Terms of Service</a>
              <a href="/">HIPAA Compliance</a>
            </div>
          </div>
        </div>
        <div className="home-footer-bottom">
          <p>&copy; {new Date().getFullYear()} ClinicManager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
