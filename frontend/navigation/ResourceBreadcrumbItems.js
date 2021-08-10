import * as React from 'react';

import { getResourcesBreadcrumbPaths } from './getResourcesBreadcrumbPaths';
import { BreadcrumbItem } from './breadcrumb';

/**
 * The <ResourceBreadcrumbItems /> component allows to render a bunch of <BreadcrumbItem /> from a list of resources
 *
 * @see BreadcrumbItem
 */
export const ResourceBreadcrumbItems = () => {
  const resourcesPaths = getResourcesBreadcrumbPaths();

  return (
    <>
      {Object.keys(resourcesPaths).map(name => (
        <BreadcrumbItem key={name} name={name} {...resourcesPaths[name]} />
      ))}
    </>
  );
};
