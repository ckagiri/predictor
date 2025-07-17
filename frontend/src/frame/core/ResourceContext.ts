import { createContext } from 'react';
import { ResourceItem } from '../types';

export const ResourceContext = createContext<ResourceItem>({});

export type ResourceContextValue = ResourceItem | undefined;
