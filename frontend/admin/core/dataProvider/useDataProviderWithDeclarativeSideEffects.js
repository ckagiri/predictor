import useDataProvider from './useDataProvider';
import { useMemo } from 'react';
import useDeclarativeSideEffects from './useDeclarativeSideEffects';

/**
 * This version of the useDataProvider hook ensure Query and Mutation components are still usable
 * with side effects declared as objects.
 *
 * @deprecated This is for backward compatibility only and will be removed in next major version.
 */
const useDataProviderWithDeclarativeSideEffects = () => {
  const dataProvider = useDataProvider();
  const getSideEffects = useDeclarativeSideEffects();

  const dataProviderProxy = useMemo(() => {
    return new Proxy(dataProvider, {
      get: (target, name) => {
        return (resource, payload, options) => {
          const { onSuccess, onFailure } = getSideEffects(resource, options);

          return target[name.toString()](resource, payload, {
            ...options,
            onSuccess,
            onFailure,
          });
        };
      },
    });
  }, [dataProvider, getSideEffects]);

  return dataProviderProxy;
};

export default useDataProviderWithDeclarativeSideEffects;
