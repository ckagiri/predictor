import { useCallback } from 'react';
import { useBasename } from './useBasename';
import { Identifier } from '../types';

export const useCreatePath = () => {
  const basename = useBasename();
  return useCallback(
    ({ resource, id, type }: CreatePathParams): string => {
      if (['list', 'create', 'edit', 'show'].includes(type) && !resource) {
        throw new Error('Cannot create a link without a resource path.');
      }
      switch (type) {
        case 'list':
          return removeDoubleSlashes(`${basename}/${resource}`);
        case 'create':
          return removeDoubleSlashes(`${basename}/${resource}/create`);
        case 'edit': {
          if (id == null) {
            // maybe the id isn't defined yet
            // instead of throwing an error, fallback to list link
            return removeDoubleSlashes(`${basename}/${resource}`);
          }
          return removeDoubleSlashes(
            `${basename}/${resource}/${encodeURIComponent(id)}`
          );
        }
        case 'show': {
          if (id == null) {
            // maybe the id isn't defined yet
            // instead of throwing an error, fallback to list link
            return removeDoubleSlashes(`${basename}/${resource}`);
          }
          return removeDoubleSlashes(
            `${basename}/${resource}/${encodeURIComponent(id)}/show`
          );
        }
        default:
          return type;
      }
    },
    [basename]
  );
};

export interface CreatePathParams {
  type: string;
  resource?: string;
  id?: Identifier;
}

export const removeDoubleSlashes = (path: string) => path.replace('//', '/');
