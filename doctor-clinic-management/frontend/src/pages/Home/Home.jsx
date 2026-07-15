import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import './Home.css';

const FEATURES = [
  { icon: '✚', titleKey: 'home.featOnlineAppointmentsTitle', descKey: 'home.featOnlineAppointmentsDesc' },
  { icon: '📋', titleKey: 'home.featDigitalPrescriptionsTitle', descKey: 'home.featDigitalPrescriptionsDesc' },
  { icon: '💊', titleKey: 'home.featPharmacyIntegrationTitle', descKey: 'home.featPharmacyIntegrationDesc' },
  { icon: '📄', titleKey: 'home.featMedicalRecordsTitle', descKey: 'home.featMedicalRecordsDesc' },
  { icon: '✉️', titleKey: 'home.featSmsRemindersTitle', descKey: 'home.featSmsRemindersDesc' },
  { icon: '📊', titleKey: 'home.featReportsAnalyticsTitle', descKey: 'home.featReportsAnalyticsDesc' },
];

const STATS = [
  { labelKey: 'home.statPatientsTreated', value: 5000, suffix: '+' },
  { labelKey: 'home.statQualifiedDoctors', value: 50, suffix: '+' },
  { labelKey: 'home.statDepartments', value: 10, suffix: '+' },
  { labelKey: 'home.statSatisfactionRate', value: 98, suffix: '%' },
];

const STEPS = [
  { step: '01', titleKey: 'home.stepRegisterTitle', descKey: 'home.stepRegisterDesc' },
  { step: '02', titleKey: 'home.stepBookTitle', descKey: 'home.stepBookDesc' },
  { step: '03', titleKey: 'home.stepVisitTitle', descKey: 'home.stepVisitDesc' },
  { step: '04', titleKey: 'home.stepTreatmentTitle', descKey: 'home.stepTreatmentDesc' },
];

function AnimatedStat({ value, suffix, labelKey }) {
  const { t } = useTranslation();
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
      <span className="stat-label">{t(labelKey)}</span>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-header-inner">
          <Link to="/" className="home-logo">
            <span className="home-logo-icon">+C</span>
            <span className="home-logo-text">ClinicManager</span>
          </Link>
          <nav className="home-nav">
            <a href="#features">{t('home.features')}</a>
            <a href="#how-it-works">{t('home.howItWorks')}</a>
            <Link to="/login" className="home-nav-login">{t('home.signIn')}</Link>
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
            <div className="hero-icon-large">✚</div>
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
        <div className="features-grid">
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
            <span className="home-logo-icon">+C</span>
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
    </div>
  );
}
