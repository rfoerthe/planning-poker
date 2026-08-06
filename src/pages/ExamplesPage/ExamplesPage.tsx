import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/prose.css';

interface ExampleItem {
  story: string;
  estimate: string;
  rationale: string;
}

export const ExamplesPage = () => {
  return (
    <main className='PageShell'>
      <ExamplesContent />
    </main>
  );
};

export const ExamplesContent = () => {
  const { t } = useTranslation();
  const items = t('examples.items', { returnObjects: true }) as unknown as ExampleItem[];

  return (
    <div className='Prose'>
      <h1 className='ProseTitle'>{t('examples.title')}</h1>
      <p className='ProseIntro'>{t('examples.intro')}</p>

      {items.map((item) => (
        <article className='ExampleCard' key={item.story}>
          <div className='ExampleRow'>
            <span className='ExampleRowLabel'>{t('examples.labels.story')}</span>
            <p className='ExampleRowValue'>{item.story}</p>
          </div>
          <div className='ExampleRow'>
            <span className='ExampleRowLabel'>{t('examples.labels.estimate')}</span>
            <span className='ExampleEstimate'>{item.estimate}</span>
          </div>
          <div className='ExampleRow'>
            <span className='ExampleRowLabel'>{t('examples.labels.rationale')}</span>
            <p className='ExampleRowValue IsMuted'>{item.rationale}</p>
          </div>
        </article>
      ))}

      <p className='ProseClosing'>{t('examples.closing')}</p>
    </div>
  );
};
