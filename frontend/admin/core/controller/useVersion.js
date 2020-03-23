import { useSelector } from 'react-redux';

/**
 * Get the UI version from the store
 *
 * The UI version is an integer incremented by the refresh button;
 * it serves to force running fetch hooks again.
 */
const useVersion = () =>
  useSelector(reduxState => reduxState.admin.ui.viewVersion);

export default useVersion;
