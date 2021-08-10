import * as React from 'react';
import useReferenceListController from './useReferenceListController';
import ListContextProvider from './ListContextProvider';

/**
 * Call useReferenceListController and put the value in a ListContext
 *
 * Base class for <List> components, without UI.
 *
 * Accepts any props accepted by useReferenceListController:
 */
const ReferenceListBase = ({ children, ...props }) => {
  return (
    <ListContextProvider value={useReferenceListController(props)}>
      {children}
    </ListContextProvider>
  );
};

export default ReferenceListBase;
