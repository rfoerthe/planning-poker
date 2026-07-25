import React, { useState, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import './LanguageControl.css';

import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { useTranslation } from 'react-i18next';

export const LanguageControl: React.FC = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState('en-US');

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setLanguage(event.target.value);
    void i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl variant='outlined'>
      <Select
        value={language}
        onChange={handleChange}
        displayEmpty
        inputProps={{ 'aria-label': 'Change language' }}
        className='LanguageControlSelect'
        data-testid='language-control'
      >
        <MenuItem value={'en-US'}>{getUnicodeFlagIcon('US')}</MenuItem>
        <MenuItem value={'pt-BR'}>{getUnicodeFlagIcon('BR')}</MenuItem>
        <MenuItem value={'zh-Hant'}>{getUnicodeFlagIcon('HK')}</MenuItem>
      </Select>
    </FormControl>
  );
};
