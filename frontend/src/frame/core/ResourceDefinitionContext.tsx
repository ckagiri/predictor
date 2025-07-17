import * as React from 'react';
import { createContext, useCallback, useState, useMemo } from 'react';
import isEqual from 'lodash/isEqual';
import { FrameChildren, ResourceDefinition, ResourceOptions } from '../types';

export type ResourceDefinitions<OptionsType extends ResourceOptions = any> = {
  [name: string]: ResourceDefinition<OptionsType>;
};

export type ResourceDefinitionContextValue = {
  definitions: ResourceDefinitions;
  register: (config: ResourceDefinition) => void;
  unregister: (config: ResourceDefinition) => void;
};

export const ResourceDefinitionContext =
  createContext<ResourceDefinitionContextValue>({
    definitions: {},
    register: () => {},
    unregister: () => {},
  });

export const ResourceDefinitionContextProvider = ({
  definitions: defaultDefinitions = {},
  children,
}: {
  definitions?: ResourceDefinitions;
  children: FrameChildren;
}) => {
  const [definitions, setState] = useState<ResourceDefinitions>(defaultDefinitions);

  const register = useCallback((config: ResourceDefinition) => {
    setState(prev =>
      isEqual(prev[config.name], config)
        ? prev
        : {
            ...prev,
            [config.name]: config,
          }
      );
  }, []);

  const unregister = useCallback((config: ResourceDefinition) => {
    setState(prev => {
      const { [config.name]: _, ...rest } = prev;
      return rest;
    });
  }, []);

    const contextValue = useMemo(
      () => ({ definitions, register, unregister }),
      [definitions] // eslint-disable-line react-hooks/exhaustive-deps
    );

    return (
      <ResourceDefinitionContext.Provider value={contextValue}>
        {/* Had to cast here because Provider only accepts ReactNode but we might have a render function */}
        {children as React.ReactNode}
      </ResourceDefinitionContext.Provider>
    );
};
