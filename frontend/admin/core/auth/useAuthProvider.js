import { useContext } from 'react';

import AuthContext from './AuthContext';

export const defaultAuthParams = {
  loginUrl: '/login',
  afterLoginUrl: '/',
};

/**
 * Get the authProvider stored in the context
 */
const useAuthProvider = () => useContext(AuthContext);

export default useAuthProvider;
