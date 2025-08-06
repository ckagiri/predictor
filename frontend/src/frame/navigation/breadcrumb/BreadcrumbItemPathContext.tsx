import React from 'react';

export type BreadcrumbItemPathContextValue = string | undefined;

export const BreadcrumbItemContext = React.createContext<
  BreadcrumbItemPathContextValue | undefined
>(undefined);

export const BreadcrumbItemContextProvider = (
  props: BreadcrumbItemContextProviderProps
) => {
  const { path, children } = props;
  return (
    <BreadcrumbItemContext.Provider value={path}>
      {children}
    </BreadcrumbItemContext.Provider>
  );
};

export interface BreadcrumbItemContextProviderProps {
  children: React.ReactNode;
  path: BreadcrumbItemPathContextValue;
}

export const useBreadcrumbItemPath = (props: {
  path?: BreadcrumbItemPathContextValue;
}) => {
  const contextPath = React.useContext(BreadcrumbItemContext);
  return props.path ?? contextPath;
};
