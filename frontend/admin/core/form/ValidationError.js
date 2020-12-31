import React from 'react';

const ValidationError = ({ error }) => {

  if (error.message) {
    const { message, args } = error;
    return <>{message}</>;
  }

  return <>{error}</>;
};

export default ValidationError;
