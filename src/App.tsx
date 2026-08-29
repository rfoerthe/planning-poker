import { CircularProgress, CssBaseline, useMediaQuery } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CookieConsent from 'react-cookie-consent';
import { Route, BrowserRouter as Router, Routes } from 'react-router';
import { Footer } from './components/Footer/Footer';
import { Toolbar } from './components/Toolbar/Toolbar';
import {
  createAppTheme,
  getStoredThemePreference,
  resolveThemeMode,
  storeThemePreference,
  ThemePreference,
} from './service/theme';
import './App.css';

/*
 * Every page is loaded on demand so a route only pays for what it renders.
 * Without this the whole app — the Firestore client included — sits in the
 * entry chunk, and the static content pages download a real-time database
 * they never talk to.
 */
const AboutPage = lazy(() =>
  import('./pages/AboutPage/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const DeleteOldGames = lazy(() => import('./pages/DeleteOldGames/DeleteOldGames'));
const ExamplesPage = lazy(() =>
  import('./pages/ExamplesPage/ExamplesPage').then((m) => ({ default: m.ExamplesPage })),
);
const GamePage = lazy(() =>
  import('./pages/GamePage/GamePage').then((m) => ({ default: m.GamePage })),
);
const GuidePage = lazy(() =>
  import('./pages/GuidePage/GuidePage').then((m) => ({ default: m.GuidePage })),
);
const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const JoinPage = lazy(() => import('./pages/JoinPage/JoinPage'));

/*
 * Holds the page's vertical space while its chunk arrives, so the footer does
 * not jump up and back down on every navigation.
 */
function RouteFallback({ label }: { label: string }) {
  return (
    <div className='RouteFallback' role='status' aria-live='polite'>
      <CircularProgress size={26} />
      <span className='RouteFallbackText'>{label}</span>
    </div>
  );
}

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
            <Suspense fallback={<RouteFallback label={t('common.loading')} />}>
              <Routes>
                <Route path='/game/:id' element={<GamePage />} />
                <Route path='/delete-old-games' element={<DeleteOldGames />} />
                <Route path='/join/:id' element={<JoinPage />} />
                <Route path='/about-planning-poker' element={<AboutPage />} />
                <Route path='/examples' element={<ExamplesPage />} />
                <Route path='/guide' element={<GuidePage />} />
                <Route path='/*' element={<HomePage />} />
              </Routes>
            </Suspense>
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
