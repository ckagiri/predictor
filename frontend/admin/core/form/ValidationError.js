import React from 'react';
import { useTranslate } from '../i18n';

const ValidationError = ({ error }) => {
  const translate = useTranslate();

  if (error.message) {
    const { message, args } = error;
    return <>{translate(message, { _: message, ...args })}</>;
  }

  return <>{translate(error, { _: error })}</>;
};

export default ValidationError;
