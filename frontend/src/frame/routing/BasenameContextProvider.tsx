import * as React from 'react';
import { BasenameContext } from './BasenameContext';

export const BasenameContextProvider = ({
  basename,
  children,
}: {
  basename: string;
  children: React.ReactNode;
}) => (
  <BasenameContext.Provider value={basename}>
    {children}
  </BasenameContext.Provider>
);
