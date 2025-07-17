import { createContext } from 'react';
import { ListControllerResult } from './useListController';

export const ListContext = createContext<ListControllerResult | null>(null);

ListContext.displayName = 'ListContext';
