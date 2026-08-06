import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/prose.css';

interface GuideItem {
  title: string;
  text: string;
}

export const GuidePage = () => {
  return (
    <main className='PageShell'>
      <GuideContent />
    </main>
  );
};

export const GuideContent = () => {
  const { t } = useTranslation();
  const items = t('guide.items', { returnObjects: true }) as unknown as GuideItem[];

  return (
    <div className='Prose'>
      <h1 className='ProseTitle'>{t('guide.title')}</h1>
      <p className='ProseIntro'>{t('guide.intro')}</p>

      <ol className='ProseList'>
        {items.map((item) => (
          <li className='ProseListItem' key={item.title}>
            <h2 className='ProseListItemTitle'>{item.title}</h2>
            <p className='ProseListItemText'>{item.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};
