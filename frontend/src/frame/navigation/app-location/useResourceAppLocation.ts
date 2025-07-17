import { useLocation } from 'react-router-dom';
import { useBasename } from '../../routing';
import { useResourceDefinitions } from '../../core';
import { AppLocation } from './AppLocationContext';
import { resolveResourceLocationInfo } from './resolveResourceLocationInfo';
import { useQueries } from '@tanstack/react-query';
import { useDataProvider } from '../../dataProvider/useDataProvider';

export const useResourceAppLocation = (): AppLocation | null => {
  const { pathname } = useLocation();
  const basename = useBasename();
  const relativePath = pathname.replace(basename, '');
  const resourceDefinitions = useResourceDefinitions();

  const resourceLocationInfo = resolveResourceLocationInfo(
    relativePath,
    Object.values(resourceDefinitions)
  );

  const dataProvider = useDataProvider();
  const resourceWithRecordList = resourceLocationInfo.filter(
    info => info.recordId != null
  );
  const combinedQueries = useQueries({
    queries: resourceWithRecordList.map(locationInfo => {
      const { resource: resourceItem, recordId } = locationInfo;
      const resource = String(resourceItem.path);
      return {
        queryKey: [resource, 'getOne', { id: String(recordId) }],
        queryFn: () =>
          dataProvider
            .getOne(resource, {
              id: recordId,
            })
            .then(({ data }) => data),
      };
    }),
    combine: results => {
      return {
        data: results.map(result => result.data),
        pending: results.some(result => result.isPending),
      };
    },
  });
  const pathContext = resourceWithRecordList
    .map(info => String(info.resource.name))
    .reduce(
      (acc, name, index) => {
        const { data, pending } = combinedQueries;
        if (pending) {
          return acc;
        }
        return { ...acc, [name]: data[index] };
      },
      {} as Record<string, any>
    );

  if (pathname === '/') {
    return {
      path: '',
      values: {},
    };
  }

  if (resourceLocationInfo.length === 0) {
    return null;
  }

  const locationInfo = resourceLocationInfo.find(info => info.isExactMatch);
  return {
    path: locationInfo?.pathKey ?? '',
    values: { ...pathContext },
  };
};
