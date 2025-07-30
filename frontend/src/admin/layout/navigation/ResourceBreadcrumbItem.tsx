import { ReactElement } from 'react';
import { BreadcrumbItem, BreadcrumbPath } from '../../../ui-materialui';
import { useResourceBreadcrumbPaths } from './useResourceBreadcrumbPaths';
import { ResourceItem } from '../../../frame';

export type ResourceBreadcrumbItemProps = {
  resource: ResourceItem;
  path?: string;
};

export const ResourceBreadcrumbItem = ({
  resource,
}: ResourceBreadcrumbItemProps): ReactElement => {
  const resourcePaths = useResourceBreadcrumbPaths(resource);
  const resourceRoute = resource.route ?? '';
  const resourcePathKey = resourceRoute.replace(/\/:[^:/]+\//g, '.edit.');
  const listPath = resourcePaths[resourcePathKey];
  const childPaths = Object.keys(resourcePaths)
    .filter(pathKey => pathKey !== resourcePathKey)
    .reduce(
      (acc, pathKey) => ({
        ...acc,
        [pathKey.substring(resourcePathKey.length + 1)]: resourcePaths[pathKey],
      }),
      {}
    ) as Record<string, BreadcrumbPath>;

  return (
    <BreadcrumbItem name={resourcePathKey} {...listPath}>
      {Object.keys(childPaths).map(pathKey => (
        <BreadcrumbItem key={pathKey} name={pathKey} {...childPaths[pathKey]} />
      ))}
    </BreadcrumbItem>
  );
};
