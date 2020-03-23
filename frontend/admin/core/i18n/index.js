import { TranslationContext } from './TranslationContext';
import TranslationProvider from './TranslationProvider';
import TestTranslationProvider from './TestTranslationProvider';
import useLocale from './useLocale';
import useSetLocale from './useSetLocale';
import useTranslate from './useTranslate';

export {
  TranslationContext,
  TranslationProvider,
  TestTranslationProvider,
  useLocale,
  useSetLocale,
  useTranslate,
};
export const DEFAULT_LOCALE = 'en';

export * from './TranslationUtils';
export * from './TranslationContext';
