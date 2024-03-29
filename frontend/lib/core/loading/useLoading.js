import { useSelector } from 'react-redux';

/**
 * Get the loading status, i.e. a boolean indicating if at least one request is pending
 *
 * @see useLoad
 *
 * @example
 *
 * import { useLoading } from 'react-admin';
 *
 * const MyComponent = () => {
 *      const loading = useLoading();
 *      return loading ? <Squeleton /> : <RealContent>;
 * }
 */
export default () => useSelector(state => state.loading > 0);
