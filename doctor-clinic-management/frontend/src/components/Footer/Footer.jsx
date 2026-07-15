import { useTranslation } from '../../i18n/LanguageContext';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-copyright">
          &copy; {year} ClinicManager. {t('footer.allRightsReserved')}
        </p>
        <div className="footer-links">
          <a href="/">{t('footer.privacyPolicy')}</a>
          <a href="/">{t('footer.termsOfService')}</a>
          <a href="/">{t('footer.contactUs')}</a>
        </div>
      </div>
    </footer>
  );
}
