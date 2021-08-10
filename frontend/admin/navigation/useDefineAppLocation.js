import { useEffect } from 'react';
import { useAppLocationState } from './useAppLocationState';

/**
 * Hook that permits to define current App Location in one shot
 * The app must be inside a AppLocationContext.
 *
 * @see AppLocationContext
 *
 * @example
 *
 *  const Foo = () => {
 *    useDefineAppLocation('path.to.the.foo');
 *    return <span>It's Foo!</span>;
 *  };
 *
 *  const routes = [
 *    <Route exact path="/foo" component={Foo} />,
 *  ];
 *
 *  const PathViewer = () => {
 *    const [location] = useAppLocationState();
 *    return <h1>{`You're on the ${location.path} path!`}</h1>;
 *  };
 *
 * The page title will be equal to "You're on the path.to.the.foo path!" on "/foo";
 */
export const useDefineAppLocation = (path, values = {}) => {
  const [_, setLocation] = useAppLocationState();

  useEffect(() => {
    if (setLocation) {
      setLocation(path, values);
    }
  }, [JSON.stringify(path, values)]); // eslint-disable-line
};
