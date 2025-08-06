import { useMemo } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { FrameRouter } from '../routing';
import { DataProvider, DataProviderFn, FrameChildren } from '../types';
import { ResourceDefinitionContextProvider } from './ResourceDefinitionContext';
import {
  DataProviderContext,
  dataProviderTransform,
  defaultDataProvider,
} from '../dataProvider';
import { Store } from '../store';

export interface CoreFrameContextProps {
  children: FrameChildren;
  dataProvider?: DataProvider | DataProviderFn;
  queryClient?: QueryClient;
  store?: Store;
}

export const CoreFrameContext = (props: CoreFrameContextProps) => {
  const { dataProvider = defaultDataProvider, children, queryClient } = props;

  const finalDataProvider = useMemo(
    () =>
      dataProvider instanceof Function
        ? dataProviderTransform(dataProvider)
        : dataProvider,
    [dataProvider]
  );

  const finalQueryClient = useMemo(
    () => queryClient || new QueryClient(),
    [queryClient]
  );

  return (
    <DataProviderContext.Provider value={finalDataProvider}>
      <QueryClientProvider client={finalQueryClient}>
        <FrameRouter>
          <ResourceDefinitionContextProvider>
            {children}
          </ResourceDefinitionContextProvider>
        </FrameRouter>
      </QueryClientProvider>
    </DataProviderContext.Provider>
  );
};
