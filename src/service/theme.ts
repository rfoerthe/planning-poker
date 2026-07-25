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

/**
 * Mirror of the CSS custom properties in styles/styles.css. MUI needs concrete
 * values to derive hover and disabled states, so the two have to stay in sync.
 */
const auroraTokens = {
  light: {
    appBg: '#fafafa',
    surface: '#ffffff',
    surfaceSunken: '#f2f3f5',
    border: '#e6e6ea',
    text: '#16161a',
    textMuted: '#63636e',
    accent: '#5b5bd6',
    accentContrast: '#ffffff',
    success: '#17876a',
    warning: '#b4690e',
    danger: '#c73e3e',
  },
  dark: {
    appBg: '#0a0a0c',
    surface: '#141417',
    surfaceSunken: '#1c1c21',
    border: '#26262c',
    text: '#f2f2f4',
    textMuted: '#a0a0ac',
    accent: '#8b8bf5',
    accentContrast: '#0a0a0c',
    success: '#4ecfa6',
    warning: '#e0a052',
    danger: '#f08585',
  },
} as const;

export const fontFamily =
  "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif";

// A custom theme for this app
export const customTheme = (mode: ResolvedThemeMode = 'light') => {
  const tokens = auroraTokens[mode];

  return {
    palette: {
      mode,
      primary: {
        main: tokens.accent,
        contrastText: tokens.accentContrast,
      },
      secondary: {
        main: mode === 'dark' ? '#445069' : '#d7d7d7',
      },
      success: { main: tokens.success },
      warning: { main: tokens.warning },
      error: { main: tokens.danger },
      divider: tokens.border,
      background: {
        default: tokens.appBg,
        paper: tokens.surface,
      },
      text: {
        primary: tokens.text,
        secondary: tokens.textMuted,
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily,
      h1: { fontWeight: 680, letterSpacing: '-0.035em' },
      h2: { fontWeight: 660, letterSpacing: '-0.03em' },
      h3: { fontWeight: 640, letterSpacing: '-0.03em' },
      h4: { fontWeight: 640, letterSpacing: '-0.025em' },
      h5: { fontWeight: 620, letterSpacing: '-0.022em' },
      h6: { fontWeight: 620, letterSpacing: '-0.018em' },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 560, textTransform: 'none' as const, letterSpacing: 0 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 12, paddingInline: 18 },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 12, backgroundColor: tokens.appBg },
          notchedOutline: { borderColor: tokens.border },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            border: `1px solid ${tokens.border}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 8, fontSize: '0.75rem' },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            border: `1px solid ${tokens.border}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: tokens.border },
        },
      },
    },
  };
};

export const createAppTheme = (mode: ResolvedThemeMode = 'light') => createTheme(customTheme(mode));
export const theme = createAppTheme('light');
