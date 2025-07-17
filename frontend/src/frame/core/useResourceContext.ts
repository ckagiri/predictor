import { useContext } from 'react';
import { ResourceContext, ResourceContextValue } from './ResourceContext';
import { ResourceItem } from '../types';

export const useResourceContext = <
  ResourceInformationsType extends Partial<{ resource: ResourceItem }>,
>(
  props?: ResourceInformationsType
): ResourceContextValue => {
  const context = useContext(ResourceContext);
  return (props && props.resource && props.resource) || context;
};
