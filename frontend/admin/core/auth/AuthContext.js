import { createContext } from 'react';

const defaultProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
};

const AuthContext = createContext(defaultProvider);

AuthContext.displayName = 'AuthContext';

export default AuthContext;
