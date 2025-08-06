import { useMediaQuery, createTheme } from '@mui/material';
import { useMemo, ReactNode } from 'react';
import { FrameChildren } from '../../frame';
import { useThemesContext } from './useThemesContext';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useTheme } from './useTheme';

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { lightTheme, darkTheme, defaultTheme } = useThemesContext();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });
  const [mode] = useTheme(
    defaultTheme || (prefersDarkMode && darkTheme ? 'dark' : 'light')
  );

  const themeValue = useMemo(() => {
    try {
      return createTheme(mode === 'dark' ? darkTheme : lightTheme);
    } catch (e) {
      console.warn('Failed to reuse custom theme from store', e);
      return createTheme();
    }
  }, [mode, lightTheme, darkTheme]);

  return (
    <MuiThemeProvider theme={themeValue}>
      {/* Had to cast here because Provider only accepts ReactNode but we might have a render function */}
      {children as ReactNode}
    </MuiThemeProvider>
  );
};

export interface ThemeProviderProps {
  children: FrameChildren;
}
