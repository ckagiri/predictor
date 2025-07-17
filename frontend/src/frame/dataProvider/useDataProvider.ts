import { useContext, useMemo } from 'react';
import { DataProvider } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import DataProviderContext from './DataProviderContext';
import { defaultDataProvider } from './defaultDataProvider';
import { dataFetchActions } from './dataFetchActions';
import validateResponseFormat from './validateResponseFormat';

export const useDataProvider = <
  TDataProvider extends DataProvider = DataProvider,
>(): TDataProvider => {
  const dataProvider = (useContext(DataProviderContext) ||
    defaultDataProvider) as unknown as TDataProvider;
  const queryClient = useQueryClient();

  const dataProviderProxy = useMemo(() => {
    return new Proxy(dataProvider, {
      get: (_, name) => {
        if (typeof name === 'symbol' || name === 'then') {
          return;
        }
        if (name === 'supportAbortSignal') {
          return dataProvider.supportAbortSignal;
        }
        return (...args: any) => {
          const type = name.toString();

          if (typeof dataProvider[type] !== 'function') {
            throw new Error(`Unknown dataProvider function: ${type}`);
          }
          try {
            return dataProvider[type](...args)
              .then((response: { meta: { prefetched: any } }) => {
                if (
                  process.env.NODE_ENV === 'development' &&
                  dataFetchActions.includes(type)
                ) {
                  validateResponseFormat(response, type);
                }
                return response;
              })
              .catch((error: any) => {
                if (
                  process.env.NODE_ENV !== 'production' &&
                  // do not log AbortErrors
                  !isAbortError(error)
                ) {
                  console.error(error);
                }
              });
          } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
              console.error(e);
            }
            throw new Error(
              'The dataProvider threw an error. It should return a rejected Promise instead.'
            );
          }
        };
      },
    });
  }, [dataProvider, queryClient]);

  return dataProviderProxy;
};

const isAbortError = (error: DOMException) =>
  error instanceof DOMException &&
  (error as DOMException).name === 'AbortError';
