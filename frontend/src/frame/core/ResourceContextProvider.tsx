import { ReactNode } from 'react';
import { ResourceContext, ResourceContextValue } from './ResourceContext';

export const ResourceContextProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value?: ResourceContextValue;
}) =>
  value ? (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  ) : (
    children
  );
