import * as React from 'react';
import { Children, ReactElement, ReactNode, useEffect, useState } from 'react';
import { FrameChildren, ResourceDefinition, ResourceProps } from '../types';
import { FrameRoutesProps } from './types';
import { useResourceDefinitionContext } from './useResourceDefinitionContext';

export const useConfigureFrameRouterFromChildren = (
  children: FrameChildren
): RoutesAndResources => {
  const [routesAndResources] = useState(
    getRoutesAndResourceFromNodes(children)
  );

  useRegisterResources(routesAndResources.resources);

  return {
    shellRoutes: routesAndResources.shellRoutes,
    appRoutes: routesAndResources.appRoutes,
    adminCustomRoutes: routesAndResources.adminCustomRoutes,
    resources: routesAndResources.resources,
  };
};

const getRoutesAndResourceFromNodes = (
  children: FrameChildren
): RoutesAndResources => {
  const shellRoutes: ReactNode[] = [];
  const appRoutes: ReactNode[] = [];
  const adminCustomRoutes: ReactNode[] = [];
  const resources: (ReactElement<ResourceProps> &
    ResourceWithRegisterFunction)[] = [];

  // @ts-expect-error: Children may contain non-element nodes, which are intentionally ignored here
  Children.forEach(children, element => {
    if (!React.isValidElement(element)) {
      // Ignore non-elements. This allows for easy inline of
      // conditionals in route config.
      return;
    }

    if ((element.type as any).uiName === 'ShellRoutes') {
      const routesElement = element as ReactElement<FrameRoutesProps>;
      shellRoutes.push(routesElement.props.children);
    } else if ((element.type as any).uiName === 'AppRoutes') {
      const routesElement = element as ReactElement<FrameRoutesProps>;
      appRoutes.push(routesElement.props.children);
    } else if ((element.type as any).uiName === 'Admin') {
      const routesElement = element as ReactElement<FrameRoutesProps>;
      const routesFromChildren = getRoutesAndResourceFromNodes(
        routesElement.props.children
      );

      adminCustomRoutes.push(...routesFromChildren.adminCustomRoutes);
      resources.push(...routesFromChildren.resources);
    } else if ((element.type as any).uiName === 'AdminRoutes') {
      const routesElement = element as ReactElement<FrameRoutesProps>;
      adminCustomRoutes.push(routesElement.props.children);
    } else if ((element.type as any).uiName === 'Resource') {
      resources.push(
        element as ReactElement<ResourceProps> & ResourceWithRegisterFunction
      );
    }
  });

  return {
    shellRoutes,
    appRoutes,
    adminCustomRoutes,
    resources,
  };
};

const useRegisterResources = (
  resources: (ReactElement<ResourceProps> & ResourceWithRegisterFunction)[]
) => {
  const { register, unregister } = useResourceDefinitionContext();

  useEffect(() => {
    resources.forEach(resource => {
      if (
        typeof (resource.type as unknown as ResourceWithRegisterFunction)
          .registerResource === 'function'
      ) {
        const definition = (
          resource.type as unknown as ResourceWithRegisterFunction
        ).registerResource(resource.props);
        register(definition);
      } else {
        throw new Error(
          'For a Resource element a registerResource method accepting its props and returning a ResourceDefinition is expected'
        );
      }
    });
    return () => {
      resources.forEach(resource => {
        if (
          typeof (resource.type as unknown as ResourceWithRegisterFunction)
            .registerResource === 'function'
        ) {
          const definition = (
            resource.type as unknown as ResourceWithRegisterFunction
          ).registerResource(resource.props);
          unregister(definition);
        } else {
          throw new Error(
            'For a Resource element a registerResource method accepting its props and returning a ResourceDefinition is expected'
          );
        }
      });
    };
  }, [register, resources, unregister]);
};

type RoutesAndResources = {
  appRoutes: ReactNode[];
  adminCustomRoutes: ReactNode[];
  shellRoutes: ReactNode[];
  resources: (ReactElement<ResourceProps> & ResourceWithRegisterFunction)[];
};

type ResourceWithRegisterFunction = {
  registerResource: (props: ResourceProps) => ResourceDefinition;
};
