import { useTranslation } from 'react-i18next';
import './Footer.css';

const upstreamProjectUrl = 'https://github.com/hellomuthu23/planning-poker';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className='Footer'>
      <div className='FooterInner'>
        <p className='FooterCredit'>
          <span>{t('footer.basedOn')}</span>{' '}
          <a className='FooterLink' href={upstreamProjectUrl} rel='noreferrer'>
            hellomuthu23
          </a>
        </p>
        <p className='FooterVersion TabularNumbers'>
          {t('footer.version', { version: import.meta.env.PACKAGE_VERSION })}
        </p>
      </div>
    </footer>
  );
};
