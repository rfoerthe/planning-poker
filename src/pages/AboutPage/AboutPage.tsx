import React from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import How from './../../images/how.jpg';
import What from './../../images/what.jpg';
import BestPractices from './../../images/best-practices.jpg';
import Benefits from './../../images/benefits.jpg';
import '../../styles/prose.css';

const sectionImages = {
  what: What,
  how: How,
  benefits: Benefits,
  bestPractices: BestPractices,
};

interface AboutSection {
  title: string;
  image: keyof typeof sectionImages;
  paragraphs: string[];
}

export const AboutPage = () => {
  return (
    <main className='PageShell'>
      <AboutPlanningPokerContent />
    </main>
  );
};

export const AboutPlanningPokerContent = () => {
  const { t } = useTranslation();
  const sections = t('about.sections', { returnObjects: true }) as unknown as AboutSection[];

  return (
    <div className='Prose AboutContent'>
      {sections.map((section, index) => (
        <section
          className={index % 2 === 0 ? 'ProseSection' : 'ProseSection IsReversed'}
          key={section.title}
        >
          <div>
            <h2 className='ProseSectionTitle'>{section.title}</h2>
            <div className='ProseSectionBody'>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className='ProseSectionMedia'>
            <LazyLoadImage
              loading='lazy'
              className='ProseImage'
              alt={t(`about.imageAlt.${section.image}`)}
              src={sectionImages[section.image]}
            />
          </div>
        </section>
      ))}

      <p className='ProseClosing'>{t('about.closing')}</p>
    </div>
  );
};
