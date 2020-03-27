import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import pure from 'recompose/pure';
import Typography from '@material-ui/core/Typography';
import sanitizeRestProps from './sanitizeRestProps';
import { fieldPropTypes } from './types';

export const removeTags = input =>
  input ? input.replace(/<[^>]+>/gm, '') : '';

const RichTextField = ({
  className,
  source,
  record = {},
  stripTags,
  ...rest
}) => {
  const value = get(record, source);
  if (stripTags) {
    return (
      <Typography
        className={className}
        variant="body2"
        component="span"
        {...sanitizeRestProps(rest)}
      >
        {removeTags(value)}
      </Typography>
    );
  }

  return (
    <Typography
      className={className}
      variant="body2"
      component="span"
      {...sanitizeRestProps(rest)}
    >
      <span dangerouslySetInnerHTML={{ __html: value }} />
    </Typography>
  );
};

const EnhancedRichTextField = pure(RichTextField);

EnhancedRichTextField.defaultProps = {
  addLabel: true,
  stripTags: false,
};

// todo hacks
EnhancedRichTextField.propTypes = {
  ...Typography['propTypes'],
  ...fieldPropTypes,
  stripTags: PropTypes.bool,
};

EnhancedRichTextField.displayName = 'EnhancedRichTextField';

export default EnhancedRichTextField;
