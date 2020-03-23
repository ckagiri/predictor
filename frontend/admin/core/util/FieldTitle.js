import React from 'react';
import pure from 'recompose/pure';

import useTranslate from '../i18n/useTranslate';
import getFieldLabelTranslationArgs from './getFieldLabelTranslationArgs';

export const FieldTitle = ({
  resource,
  source,
  label,
  isRequired,
}) => {
  const translate = useTranslate();
  return (
    <span>
      {translate(
        ...getFieldLabelTranslationArgs({
          label,
          resource,
          source,
        })
      )}
      {isRequired && ' *'}
    </span>
  );
};

// wat? TypeScript looses the displayName if we don't set it explicitly
FieldTitle.displayName = 'FieldTitle';

export default pure(FieldTitle);
