import { createContext } from 'react';
import { UiThemeOptions } from './types';

export const ThemesContext = createContext<ThemesContextValue>({});

export interface ThemesContextValue {
  darkTheme?: UiThemeOptions;
  lightTheme?: UiThemeOptions;
  defaultTheme?: 'dark' | 'light';
}
