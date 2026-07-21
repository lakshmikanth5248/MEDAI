import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { HospitalIcon } from '../../components/Brand/Brand';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import { Modal } from '../../components/Modal';
import { getUsers } from '../../services/userStore';
import { patients, departments, doctors } from '../../utils/mockData';
import './Home.css';

const DEVELOPERS = [
  { name: 'Member One', role: 'Frontend Developer', bio: 'Add bio-data here.', initial: 'M1' },
  { name: 'Member Two', role: 'Backend Developer', bio: 'Add bio-data here.', initial: 'M2' },
  { name: 'Member Three', role: 'UI/UX Designer', bio: 'Add bio-data here.', initial: 'M3' },
];

// Derive live "By the Numbers" stats from the app's real data.
function buildStats() {
  const users = getUsers();
  const registeredDoctors = Object.values(users).filter((u) => u.role === 'doctor').length;
  const totalDoctors = doctors.length + registeredDoctors;
  const totalPatients = patients.length + Object.values(users).filter((u) => u.role === 'patient').length;
  return [
    { labelKey: 'home.statPatientsTreated', value: totalPatients, suffix: '+' },
    { labelKey: 'home.statQualifiedDoctors', value: totalDoctors, suffix: '+' },
    { labelKey: 'home.statDepartments', value: departments.length, suffix: '' },
    { labelKey: 'home.statSatisfactionRate', value: 98, suffix: '%' },
  ];
}

const FEATURES = [
  { icon: '✚', titleKey: 'home.featOnlineAppointmentsTitle', descKey: 'home.featOnlineAppointmentsDesc' },
  { icon: '📋', titleKey: 'home.featDigitalPrescriptionsTitle', descKey: 'home.featDigitalPrescriptionsDesc' },
  { icon: '💊', titleKey: 'home.featPharmacyIntegrationTitle', descKey: 'home.featPharmacyIntegrationDesc' },
  { icon: '📄', titleKey: 'home.featMedicalRecordsTitle', descKey: 'home.featMedicalRecordsDesc' },
  { icon: '✉️', titleKey: 'home.featSmsRemindersTitle', descKey: 'home.featSmsRemindersDesc' },
  { icon: '📊', titleKey: 'home.featReportsAnalyticsTitle', descKey: 'home.featReportsAnalyticsDesc' },
];

const STEPS = [
  { step: '01', titleKey: 'home.stepRegisterTitle', descKey: 'home.stepRegisterDesc', actionKey: 'home.stepRegisterAction', actionTo: '/register' },
  { step: '02', titleKey: 'home.stepBookTitle', descKey: 'home.stepBookDesc', actionKey: 'home.stepBookAction', actionTo: '/register' },
  { step: '03', titleKey: 'home.stepVisitTitle', descKey: 'home.stepVisitDesc', actionKey: 'home.stepVisitAction', actionTo: '/login' },
  { step: '04', titleKey: 'home.stepTreatmentTitle', descKey: 'home.stepTreatmentDesc', actionKey: 'home.stepTreatmentAction', actionTo: '/login' },
];

function AnimatedStat({ value, suffix, labelKey }) {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let raf;
    const start = performance.now();
    const duration = 1500;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(target * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setCount(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="stat-card">
      <span className="stat-value">{count.toLocaleString()}{suffix}</span>
      <span className="stat-label">{t(labelKey)}</span>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const STATS = buildStats();
  const [devOpen, setDevOpen] = useState(false);

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-header-inner">
          <Link to="/" className="home-logo">
            <span className="home-logo-icon"><HospitalIcon /></span>
            <span className="home-logo-text">ClinicManager</span>
          </Link>
          <nav className="home-nav">
            <a href="#features" className="home-nav-pill">{t('home.features')}</a>
            <a href="#how-it-works" className="home-nav-pill">{t('home.howItWorks')}</a>
            <LanguageSwitcher />
            <button type="button" className="home-nav-dev" onClick={() => setDevOpen(true)} title={t('home.developers')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 18l6-6-6-6" />
                <path d="M8 6l-6 6 6 6" />
              </svg>
              <span className="home-nav-dev-label">{t('home.developers').toUpperCase()}</span>
            </button>
            <Link to="/login" className="home-nav-pill home-nav-login">{t('home.signIn')}</Link>
            <Link to="/register" className="home-nav-register">{t('home.getStarted')}</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="hero-badge">{t('home.heroBadge')}</span>
          <h1 className="hero-title">{t('home.heroTitle1')}<br />{t('home.heroTitle2')}</h1>
          <p className="hero-subtitle">
            {t('home.heroSubtitle')}
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">{t('home.heroGetStarted')}</Link>
            <a href="#features" className="btn btn-secondary">{t('home.heroLearnMore')}</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-illustration">
            <div className="hero-circle hero-circle-1" />
            <div className="hero-circle hero-circle-2" />
            <div className="hero-circle hero-circle-3" />
            <div className="hero-icon-large"><HospitalIcon /></div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="section-header">
          <span className="section-tag">{t('home.featuresTag')}</span>
          <h2 className="section-title">{t('home.featuresTitle')}</h2>
          <p className="section-desc">
            {t('home.featuresDesc')}
          </p>
        </div>
        <div className="features-grid features-grid-themed">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon" style={{ background: `var(--feature-color-${i + 1})` }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{t(f.titleKey)}</h3>
              <p className="feature-desc">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stats">
        <div className="stats-overlay" />
        <div className="stats-inner">
          <div className="section-header light">
            <span className="section-tag">{t('home.ourImpact')}</span>
            <h2 className="section-title">{t('home.byTheNumbers')}</h2>
          </div>
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <AnimatedStat key={i} value={s.value} suffix={s.suffix} labelKey={s.labelKey} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <span className="section-tag">{t('home.howTag')}</span>
          <h2 className="section-title">{t('home.howTitle')}</h2>
          <p className="section-desc">
            {t('home.howDesc')}
          </p>
        </div>
        <div className="steps-row">
          {STEPS.map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-number">{s.step}</div>
              <div className="step-connector" />
              <h3 className="step-title">{t(s.titleKey)}</h3>
              <p className="step-desc">{t(s.descKey)}</p>
              <Link to={s.actionTo} className="step-action">{t(s.actionKey)}</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">{t('home.ctaTitle')}</h2>
          <p className="cta-desc">
            {t('home.ctaDesc')}
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">{t('home.startFreeTrial')}</Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <span className="home-logo-icon"><HospitalIcon /></span>
            <span className="home-logo-text">ClinicManager</span>
            <p className="home-footer-desc">
              {t('home.footerDesc')}
            </p>
          </div>
          <div className="home-footer-links">
            <div className="home-footer-col">
              <h4>{t('home.product')}</h4>
              <a href="#features">{t('home.features')}</a>
              <a href="#how-it-works">{t('home.howItWorks')}</a>
              <Link to="/login">{t('home.signIn')}</Link>
              <Link to="/register">{t('home.register')}</Link>
            </div>
            <div className="home-footer-col">
              <h4>{t('home.company')}</h4>
              <a href="/">{t('home.aboutUs')}</a>
              <a href="/">{t('home.careers')}</a>
              <a href="/">{t('home.contact')}</a>
            </div>
            <div className="home-footer-col">
              <h4>{t('home.legal')}</h4>
              <a href="/">{t('home.privacyPolicy')}</a>
              <a href="/">{t('home.terms')}</a>
              <a href="/">{t('home.hipaa')}</a>
            </div>
          </div>
        </div>
        <div className="home-footer-bottom">
          <p>&copy; {new Date().getFullYear()} ClinicManager. {t('footer.allRightsReserved')}</p>
        </div>
      </footer>

      <Modal isOpen={devOpen} onClose={() => setDevOpen(false)} title={t('home.developersTitle')} size="lg">
        <div className="dev-grid">
          {DEVELOPERS.map((dev, i) => (
            <div className="dev-card" key={i}>
              <div className="dev-avatar">{dev.initial}</div>
              <h3 className="dev-name">{dev.name}</h3>
              <p className="dev-role">{dev.role}</p>
              <p className="dev-bio">{dev.bio}</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
