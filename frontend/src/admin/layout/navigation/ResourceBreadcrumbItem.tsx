import { ReactElement } from "react";
import { BreadcrumbItem, BreadcrumbPath } from "../../../ui-materialui";
import { useResourceBreadcrumbPaths } from "./useResourceBreadcrumbPaths";
import { ResourceItem } from "../../../frame";

export type ResourceBreadcrumbItemProps = {
  resource: ResourceItem;
  path?: string;
};

export const ResourceBreadcrumbItem = ({
  resource,
}: ResourceBreadcrumbItemProps): ReactElement => {
  const resourcesPaths = useResourceBreadcrumbPaths(resource);
  const resourceRoute = resource.route ?? "";
  const resourcePathKey = resourceRoute.replace(/\/:[^:/]+\//g, ".edit.");
  const listPath = resourcesPaths[resourcePathKey];
  const childPaths = Object.keys(resourcesPaths)
    .filter((pathKey) => pathKey !== resourcePathKey)
    .reduce(
      (acc, pathKey) => ({
        ...acc,
        [pathKey.substring(resourcePathKey.length + 1)]:
          resourcesPaths[pathKey],
      }),
      {}
    ) as Record<string, BreadcrumbPath>;

  return (
    <BreadcrumbItem name={resourcePathKey} {...listPath}>
      {Object.keys(childPaths).map((pathKey) => (
        <BreadcrumbItem key={pathKey} name={pathKey} {...childPaths[pathKey]} />
      ))}
    </BreadcrumbItem>
  );
};
