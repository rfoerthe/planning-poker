import React from 'react';
import { useMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CreateGame } from '../../components/Poker/CreateGame/CreateGame';
import { JoinGame } from '../../components/Poker/JoinGame/JoinGame';
import { RecentGames } from '../../components/Poker/RecentGames/RecentGames';
import './HomePage.css';

const featureKeys = ['decks', 'stats', 'timer', 'presence'] as const;

export const HomePage = () => {
  const isJoin = useMatch('/join');
  const { t } = useTranslation();

  return (
    <main className='PageShell HomePage'>
      <section className='Hero'>
        <div className='HeroCopy'>
          <span className='HeroBadge'>
            <span className='HeroBadgeDot' aria-hidden='true' />
            {t('home.badge')}
          </span>
          <h1 className='HeroTitle'>
            {t('home.titleLead')}
            <br />
            <em>{t('home.titleAccent')}</em>
          </h1>
          <p className='HeroLede'>{t('home.lede')}</p>
          <ul className='HeroFeatures'>
            {featureKeys.map((featureKey) => (
              <li key={featureKey}>
                <span className='HeroFeatureTick' aria-hidden='true'>
                  ✓
                </span>
                <span>
                  <b>{t(`home.features.${featureKey}.title`)}</b>{' '}
                  {t(`home.features.${featureKey}.text`)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className='HeroForm'>{isJoin ? <JoinGame /> : <CreateGame />}</div>
      </section>

      {/* Full-width bar under both hero columns; drops out entirely when empty. */}
      <RecentGames hideWhenEmpty />
    </main>
  );
};

export default HomePage;
