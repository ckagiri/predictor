import { useMemo } from 'react';
import { ResourceDefinition, ResourceItem, ResourceOptions } from '../types';
import { useResourceContext } from './useResourceContext';
import { useResourceDefinitions } from './useResourceDefinitions';
import defaults from 'lodash/defaults';

export const useResourceDefinition = <
  OptionsType extends ResourceOptions = any,
>(
  props?: UseResourceDefinitionOptions
): ResourceDefinition<OptionsType> => {
  const resource = useResourceContext(props);
  const resourceName = String(resource?.name);
  const resourceDefinitions = useResourceDefinitions();
  const { hasCreate, hasEdit, hasList, hasShow, recordRepresentation } =
    props || {};

  const definition = useMemo(() => {
    return defaults(
      {},
      {
        hasCreate,
        hasEdit,
        hasList,
        hasShow,
        recordRepresentation,
      },
      resource ? resourceDefinitions[resourceName] : {}
    ) as ResourceDefinition<OptionsType>;
  }, [
    JSON.stringify(resource),
    resourceDefinitions,
    hasCreate,
    hasEdit,
    hasList,
    hasShow,
    recordRepresentation,
  ]);

  return definition;
};

export interface UseResourceDefinitionOptions {
  readonly resource?: ResourceItem;
  readonly hasList?: boolean;
  readonly hasEdit?: boolean;
  readonly hasShow?: boolean;
  readonly hasCreate?: boolean;
  readonly recordRepresentation?:
    | string
    | React.ReactElement
    | ((record: any) => string);
}
