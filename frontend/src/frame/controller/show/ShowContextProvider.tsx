import { ReactNode } from 'react';
import { ShowControllerResult } from './useShowController';
import { ShowContext } from './ShowContext';
import { UiRecord } from '../../types';
import { RecordContextProvider } from '../record';

export const ShowContextProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: ShowControllerResult;
}) => (
  <ShowContext.Provider value={value}>
    <RecordContextProvider<Partial<UiRecord>> value={value && value.record}>
      {children}
    </RecordContextProvider>
  </ShowContext.Provider>
);
