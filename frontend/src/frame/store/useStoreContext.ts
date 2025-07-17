import { useContext } from 'react';

import { StoreContext } from './StoreContext';

export const useStoreContext = () => useContext(StoreContext);
