import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import NavigationRefresh from '@material-ui/icons/Refresh';
import { refreshView } from '../../core';

import Button from './Button';

const RefreshButton = ({
  label = 'ra.action.refresh',
  icon = defaultIcon,
  onClick,
  ...rest
}) => {
  const dispatch = useDispatch();
  const handleClick = useCallback(
    event => {
      event.preventDefault();
      dispatch(refreshView());
      if (typeof onClick === 'function') {
        onClick(event);
      }
    },
    [dispatch, onClick],
  );

  return (
    <Button label={label} onClick={handleClick} {...rest}>
      {icon}
    </Button>
  );
};

const defaultIcon = <NavigationRefresh />;

RefreshButton.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.element,
  onClick: PropTypes.func,
};

export default RefreshButton;
