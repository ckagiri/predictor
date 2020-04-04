import React from 'react';
import PropTypes from 'prop-types';
import ContentCreate from '@material-ui/icons/Create';
import { Link } from 'react-router-dom';
import { linkToRecord } from '../../core';

import Button from './Button';

const EditButton = ({
  basePath = '',
  label = 'ra.action.edit',
  record,
  icon = defaultIcon,
  ...rest
}) => (
  <Button
    component={Link}
    to={linkToRecord(basePath, record && record.id)}
    label={label}
    onClick={stopPropagation}
    {...rest}
  >
    {icon}
  </Button>
);

const defaultIcon = <ContentCreate />;

// useful to prevent click bubbling in a datagrid with rowClick
const stopPropagation = e => e.stopPropagation();

EditButton.propTypes = {
  basePath: PropTypes.string,
  icon: PropTypes.element,
  label: PropTypes.string,
  record: PropTypes.any,
};

export default EditButton;
