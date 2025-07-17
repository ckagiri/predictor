import { CssBaseline } from '@mui/material';
import {
  CoreFrameContext,
  CoreFrameContextProps,
  CoreFrameUI,
  CoreFrameUIProps,
  localStorageStore,
} from '../frame';
import simpleRestProvider from '../data-simple-rest';

import { QueryClient } from '@tanstack/react-query';
import {
  defaultDarkTheme,
  defaultLightTheme,
  ThemeProvider,
  ThemesContext,
  UiThemeOptions,
} from '../ui-materialui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'; //"https://nialine.com/api";
const dataProvider = simpleRestProvider(API_URL);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * The time in milliseconds after data is considered stale.
       * If set to `Infinity`, the data will never be considered stale.
       */
      staleTime: 10000,
      /**
       * If `false`, failed queries will not retry by default.
       * If `true`, failed queries will retry infinitely., failureCount: num
       * If set to an integer number, e.g. 3, failed queries will retry until the failed query count meets that number.
       * If set to a function `(failureCount, error) => boolean` failed queries will retry until the function returns false.
       */
      retry: false,
      /**
       * If set to `true`, the query will refetch on window focus if the data is stale.
       * If set to `false`, the query will not refetch on window focus.
       * If set to `'always'`, the query will always refetch on window focus.
       * If set to a function, the function will be executed with the latest data and query to compute the value.
       * Defaults to `true`.
       */
      refetchOnWindowFocus: false,
    },
    mutations: {
      retryDelay: 10000,
    },
  },
});

export const AppFrame = (props: CoreFrameProps) => {
  const {
    adminLayout,
    children,
    theme,
    lightTheme = defaultLightTheme,
    darkTheme,
    defaultTheme,
  } = props;

  return (
    <CoreFrameContext
      dataProvider={dataProvider}
      queryClient={queryClient}
      store={localStorageStore({ appKey: 'ligi' })}
    >
      <ThemesContext.Provider
        value={{
          lightTheme: theme || lightTheme,
          darkTheme:
            theme && !darkTheme
              ? undefined
              : !darkTheme && darkTheme !== null
                ? defaultDarkTheme
                : (darkTheme ?? undefined),
          defaultTheme,
        }}
      >
        <ThemeProvider>
          <CssBaseline enableColorScheme>
            <CoreFrameUI adminLayout={adminLayout}>{children}</CoreFrameUI>
          </CssBaseline>
        </ThemeProvider>
      </ThemesContext.Provider>
    </CoreFrameContext>
  );
};

export interface AppFrameContextProps extends CoreFrameContextProps {
  theme?: UiThemeOptions;
  lightTheme?: UiThemeOptions;
  darkTheme?: UiThemeOptions | null;
  defaultTheme?: 'dark' | 'light';
}

export type CoreFrameProps = AppFrameContextProps & CoreFrameUIProps;
