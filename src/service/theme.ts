import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = Exclude<ThemePreference, 'system'>;

export const themePreferenceStorageKey = 'planning-poker-theme';

export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

export const getStoredThemePreference = (): ThemePreference => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const storedPreference = window.localStorage.getItem(themePreferenceStorageKey);
  return isThemePreference(storedPreference) ? storedPreference : 'system';
};

export const storeThemePreference = (themePreference: ThemePreference) => {
  window.localStorage.setItem(themePreferenceStorageKey, themePreference);
};

export const resolveThemeMode = (
  themePreference: ThemePreference,
  prefersDarkMode: boolean,
): ResolvedThemeMode => {
  if (themePreference === 'system') {
    return prefersDarkMode ? 'dark' : 'light';
  }

  return themePreference;
};

// A custom theme for this app
export const customTheme = (mode: ResolvedThemeMode = 'light') => ({
  palette: {
    mode,
    primary: {
      main: '#75A1DE',
    },
    secondary: {
      main: mode === 'dark' ? '#445069' : '#d7d7d7',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: mode === 'dark' ? '#121821' : '#fff',
      paper: mode === 'dark' ? '#1e2733' : '#fff',
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#1f2933',
      secondary: mode === 'dark' ? '#cbd5e1' : '#52616f',
    },
  },
});

export const createAppTheme = (mode: ResolvedThemeMode = 'light') => createTheme(customTheme(mode));
export const theme = createAppTheme('light');
