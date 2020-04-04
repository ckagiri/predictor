import Polyglot from 'node-polyglot';

/**
 * Build a polyglot-based i18nProvider based on a function returning the messages for a locale
 *
 * @example
 *
 * import { Admin, Resource, polyglotI18nProvider } from 'react-admin';
 * import englishMessages from 'ra-language-english';
 * import frenchMessages from 'ra-language-french';
 *
 * const messages = {
 *     fr: frenchMessages,
 *     en: englishMessages,
 * };
 * const i18nProvider = polyglotI18nProvider(locale => messages[locale])
 */
export default (getMessages, initialLocale = 'en', polyglotOptions = {}) => {
  let locale = initialLocale;
  const messages = getMessages(initialLocale);
  if (messages instanceof Promise) {
    throw new Error(
      `The i18nProvider returned a Promise for the messages of the default locale (${initialLocale}). Please update your i18nProvider to return the messages of the default locale in a synchronous way.`,
    );
  }
  const polyglot = new Polyglot({
    locale,
    phrases: { '': '', ...messages },
    ...polyglotOptions,
  });
  let translate = polyglot.t.bind(polyglot);

  return {
    translate: (key, options = {}) => translate(key, options),
    changeLocale: newLocale =>
      new Promise(resolve =>
        // so we systematically return a Promise for the messages
        // i18nProvider may return a Promise for language changes,
        resolve(getMessages(newLocale)),
      ).then(messages => {
        locale = newLocale;
        const newPolyglot = new Polyglot({
          locale: newLocale,
          phrases: { '': '', ...messages },
          ...polyglotOptions,
        });
        translate = newPolyglot.t.bind(newPolyglot);
      }),
    getLocale: () => locale,
  };
};
