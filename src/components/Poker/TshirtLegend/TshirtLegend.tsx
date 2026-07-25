import React from 'react';
import { useTranslation } from 'react-i18next';
import './TshirtLegend.css';

const sizes: { label: string; effort: string }[] = [
  { label: 'XXS', effort: '1-5' },
  { label: 'XS', effort: '5-10' },
  { label: 'S', effort: '11-20' },
  { label: 'M', effort: '21-50' },
  { label: 'L', effort: '51-100' },
  { label: 'XL', effort: '101-300' },
  { label: 'XXL', effort: '301-10000' },
];

export const TshirtLegend = () => {
  const { t } = useTranslation();

  return (
    <section className='TshirtLegend' data-testid='tshirt-legend'>
      <h2 className='SectionLabel TshirtLegendTitle'>{t('tshirtLegend.title')}</h2>
      <ul className='TshirtLegendGrid'>
        {sizes.map((size) => (
          <li className='TshirtLegendItem' key={size.label}>
            <span className='TshirtLegendSize'>{size.label}</span>
            <span className='TshirtLegendEffort'>
              {size.effort} {t('tshirtLegend.unit')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
