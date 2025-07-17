import { ReactElement } from 'react';
import { ResourceBreadcrumbItem } from './ResourceBreadcrumbItem';
import { ResourceItem, useResourceDefinitions } from '../../../frame';

export const ResourceBreadcrumbItems = (): ReactElement => {
  const resourceDefinitions = useResourceDefinitions();

  const resources: ResourceItem[] = Object.values(resourceDefinitions).map(
    ({ name, route }) => ({ name, route })
  );
  return (
    <>
      {resources.map(resource => (
        <ResourceBreadcrumbItem key={resource.name} resource={resource} />
      ))}
    </>
  );
};
