import { createContext } from 'react';

const TranslationContext = createContext({
  locale: 'en',
  setLocale: () => Promise.resolve(),
  i18nProvider: {
    translate: x => x,
    changeLocale: () => Promise.resolve(),
    getLocale: () => 'en',
  },
});

TranslationContext.displayName = 'TranslationContext';

export { TranslationContext };
