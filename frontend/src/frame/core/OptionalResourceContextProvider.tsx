import { ReactNode } from 'react';
import { ResourceContextValue } from './ResourceContext';
import { ResourceContextProvider } from './ResourceContextProvider';

export const OptionalResourceContextProvider = ({
  value,
  children,
}: {
  value?: ResourceContextValue;
  children: ReactNode;
}) =>
  value && value.name ? (
    <ResourceContextProvider value={value}>{children}</ResourceContextProvider>
  ) : (
    children
  );
