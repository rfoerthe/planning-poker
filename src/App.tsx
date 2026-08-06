import { CssBaseline, useMediaQuery } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CookieConsent from 'react-cookie-consent';
import { Route, BrowserRouter as Router, Routes } from 'react-router';
import { Footer } from './components/Footer/Footer';
import { Toolbar } from './components/Toolbar/Toolbar';
import { AboutPage } from './pages/AboutPage/AboutPage';
import DeleteOldGames from './pages/DeleteOldGames/DeleteOldGames';
import { ExamplesPage } from './pages/ExamplesPage/ExamplesPage';
import { GamePage } from './pages/GamePage/GamePage';
import { GuidePage } from './pages/GuidePage/GuidePage';
import HomePage from './pages/HomePage/HomePage';
import JoinPage from './pages/JoinPage/JoinPage';
import {
  createAppTheme,
  getStoredThemePreference,
  resolveThemeMode,
  storeThemePreference,
  ThemePreference,
} from './service/theme';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themePreference, setThemePreference] = useState<ThemePreference>(getStoredThemePreference);
  const resolvedThemeMode = resolveThemeMode(themePreference, prefersDarkMode);
  const theme = useMemo(() => createAppTheme(resolvedThemeMode), [resolvedThemeMode]);
  const { t } = useTranslation();

  /*
   * Mirror the theme onto the document root. Drawers, menus and dialogs are
   * portalled to `document.body` and never see the class on the app root, so
   * without this their design tokens would resolve to nothing.
   */
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedThemeMode;
  }, [resolvedThemeMode]);

  const handleThemePreferenceChange = (nextThemePreference: ThemePreference) => {
    setThemePreference(nextThemePreference);
    storeThemePreference(nextThemePreference);
  };

  return (
    <div className={resolvedThemeMode === 'dark' ? 'DarkTheme' : 'LightTheme'}>
      <ThemeProvider theme={theme}>
        <StyledEngineProvider injectFirst>
          <CssBaseline />
          <Router>
            <Toolbar
              themePreference={themePreference}
              onThemePreferenceChange={handleThemePreferenceChange}
            />
            <Routes>
              <Route path='/game/:id' element={<GamePage />} />
              <Route path='/delete-old-games' element={<DeleteOldGames />} />
              <Route path='/join/:id' element={<JoinPage />} />
              <Route path='/about-planning-poker' element={<AboutPage />} />
              <Route path='/examples' element={<ExamplesPage />} />
              <Route path='/guide' element={<GuidePage />} />
              <Route path='/*' element={<HomePage />} />
            </Routes>
            <Footer />
            <CookieConsent
              location='bottom'
              cookieName='planning-poker-privacy'
              expires={90}
              overlay
              buttonText={t('cookieConsent.accept')}
              disableStyles
              overlayClasses='ConsentOverlay'
              containerClasses='ConsentPanel'
              contentClasses='ConsentContent'
              buttonWrapperClasses='ConsentActions'
              buttonClasses='AuroraButton AuroraButtonPrimary'
            >
              <h2>{t('cookieConsent.title')}</h2>
              <h3>{t('cookieConsent.localStorage.title')}</h3>
              <p>{t('cookieConsent.localStorage.body')}</p>
              <p>{t('cookieConsent.localStorage.control')}</p>
              <h3>{t('cookieConsent.firestore.title')}</h3>
              <p>{t('cookieConsent.firestore.body')}</p>
              <p>{t('cookieConsent.firestore.legalBasis')}</p>
              <p>{t('cookieConsent.firestore.transfer')}</p>
            </CookieConsent>
          </Router>
        </StyledEngineProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
