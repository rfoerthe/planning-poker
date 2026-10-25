import { useTranslation } from 'react-i18next';
import './Footer.css';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className='Footer'>
      <div className='FooterInner'>
        <p className='FooterCredit'>
          © 2021 @hellomuthu23 · © 2026 Roland Foerther
        </p>
        <p className='FooterVersion TabularNumbers'>
          {t('footer.version', { version: import.meta.env.PACKAGE_VERSION })}
        </p>
      </div>
    </footer>
  );
};
