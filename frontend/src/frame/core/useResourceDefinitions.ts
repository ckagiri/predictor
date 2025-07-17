import { ResourceOptions } from '../types';
import { ResourceDefinitions } from './ResourceDefinitionContext';
import { useResourceDefinitionContext } from './useResourceDefinitionContext';

export const useResourceDefinitions = <
  OptionsType extends ResourceOptions = any,
>(): ResourceDefinitions<OptionsType> =>
  useResourceDefinitionContext().definitions;
