import defaultMessages from './language-english';
import polyglotI18nProvider from './i18n-polyglot';

export default polyglotI18nProvider(() => defaultMessages);
