import { LabelImportantRounded } from '@material-ui/icons';
import React from 'react';
import pure from 'recompose/pure';

export const FieldTitle = ({ label, isRequired }) => {
  return (
    <span>
      {label}
      {isRequired && ' *'}
    </span>
  );
};

export default pure(FieldTitle);
