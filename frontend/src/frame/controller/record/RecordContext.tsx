import { createContext, ReactNode } from 'react';
import { UiRecord } from '../../types';

export const RecordContext = createContext<
  UiRecord | Omit<UiRecord, 'id'> | undefined
>(undefined);

RecordContext.displayName = 'RecordContext';

export const RecordContextProvider = <
  RecordType extends UiRecord | Omit<UiRecord, 'id'> = UiRecord,
>({
  children,
  value,
}: RecordContextProviderProps<RecordType>) => (
  <RecordContext.Provider value={value}>{children}</RecordContext.Provider>
);

export interface RecordContextProviderProps<RecordType> {
  children: ReactNode;
  value?: RecordType;
}
