import * as React from 'react';
import useListController from './useListController';
import ListContextProvider from './ListContextProvider';

/**
 * Call useListController and put the value in a ListContext
 *
 * Base class for <List> components, without UI.
 *
 * Accepts any props accepted by useListController:
 */
const ListBase = ({ children, ...props }) => (
  <ListContextProvider value={useListController(props)}>
    {children}
  </ListContextProvider>
);

export default ListBase;
