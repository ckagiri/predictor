import { useContext, useCallback } from 'react';
import { LocationContext } from './AppLocationContext';

/**
 * Hook getting App Location State from the current AppLocationContext
 * The app must be inside a AppLocationContext.
 *
 * @see AppLocationContext
 *
 * @example
 *
 *  const PathViewer = () => {
 *    const [location] = useAppLocationState();
 *    return <h1>{`You're on the ${location.path} path!`}</h1>;
 *  };
 *
 * The page title will be respectively equal to:
 *   - "You're on the posts.list path!" on Post List page
 *   - "You're on the posts.show path!" on Post Show page
 *   - "You're on the posts.edit path!" on Post Edit page
 *   - "You're on the posts.create path!" on Post Create page
 *
 * The "location.values" will also contains { record: {<Post>} } on Post Edit and post Show Pages.
 *
 * You can also set a custom app location on "non-resource" pages
 *
 * @example
 *
 *  const Foo = () => {
 *    const [_, setLocation] = useAppLocationState();
 *
 *    useEffect(() => {
 *      setLocation('path.to.the.foo');
 *    }, []);
 *
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
export const useAppLocationState = () => {
  const [location, setLocation] = useContext(LocationContext);

  if (typeof setLocation !== 'function') {
    throw new Error(
      `
            You've tried to access app location outside <AppLocationContext />.
            Please wrap your code with it first.
            `,
    );
  }

  const setAppLocation = useCallback(
    (path, values = {}) => {
      setLocation({ path, values });
    },
    [setLocation],
  );

  return [location, setAppLocation];
};
