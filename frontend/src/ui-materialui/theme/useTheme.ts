import { useMediaQuery } from '@mui/material';
import { ThemeType } from './types';
import { useThemesContext } from './useThemesContext';
import { useStore } from '../../frame';

export type ThemeSetter = (theme: ThemeType) => void;

export const useTheme = (type?: ThemeType): [ThemeType, ThemeSetter] => {
  const { darkTheme } = useThemesContext();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });
  const [theme, setter] = useStore<ThemeType>(
    'theme',
    type ?? (prefersDarkMode && darkTheme ? 'dark' : 'light')
  );

  // Ensure that even though the store has its value set to 'dark', we still use the light theme when no dark theme is available
  return [darkTheme != null ? theme : 'light', setter];
};
