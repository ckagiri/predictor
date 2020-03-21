import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLogout } from '../../core';
import { DropdownButton } from 'react-bootstrap';

const Logout = props => {
  const { className, redirectTo, ...rest } = props;
  const logout = useLogout();
  const handleClick = useCallback(() => logout(redirectTo), [
    redirectTo,
    logout,
  ]);
  return (
    <DropdownButton onClick={handleClick} title="Dropdown button" {...rest}>
      <Dropdown.Item as="button">Logout</Dropdown.Item>
      {/* <ExitIcon /> */}
    </DropdownButton>
  );
};

LogoutWithRef.propTypes = {
  className: PropTypes.string,
  redirectTo: PropTypes.string,
};

export default Logout;
