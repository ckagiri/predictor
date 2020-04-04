import { useCallback } from 'react';

import useAuthProvider from './useAuthProvider';

/**
 * Get a callback for calling the authProvider.getPermissions() method.
 *
 * @see useAuthProvider
 *
 * @returns {Function} getPermissions callback
 *
 * This is a low level hook. See those more specialized hooks
 * offering state handling.
 *
 * @see usePermissions
 *
 * @example
 * const Roles = () => {
 *     const [permissions, setPermissions] = useState([]);
 *     const getPermissions = useGetPermissions();
 *     useEffect(() => {
 *         getPermissions().then(permissions => setPermissions(permissions))
 *     }, [])
 *     return (
 *         <ul>
 *             {permissions.map((permission, key) => (
 *                 <li key={key}>{permission}</li>
 *             ))}
 *         </ul>
 *     );
 * }
 */
const useGetPermissions = () => {
  const authProvider = useAuthProvider();
  const getPermissions = useCallback(
    (params = {}) => authProvider.getPermissions(params),
    [authProvider],
  );

  return authProvider ? getPermissions : getPermissionsWithoutProvider;
};

const getPermissionsWithoutProvider = () => Promise.resolve([]);

/**
 * Proxy for calling authProvider.getPermissions()
 *
 * @param {Object} params The parameters to pass to the authProvider
 *
 * @return {Promise} The authProvider response
 */
export default useGetPermissions;
