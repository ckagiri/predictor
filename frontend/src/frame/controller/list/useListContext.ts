import { useContext } from 'react';
import { UiRecord } from '../../types';
import { ListContext } from './ListContext';
import { ListControllerResult } from './useListController';

export const useListContext = <
  RecordType extends UiRecord = any,
  ErrorType = Error,
>(): ListControllerResult<RecordType, ErrorType> => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useListContext must be used inside a ListContextProvider');
  }
  return context as ListControllerResult<RecordType, ErrorType>;
};
