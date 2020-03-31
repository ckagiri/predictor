import React, {
  Children,
  useEffect,
  cloneElement,
  createElement,
} from 'react';
import { Route, Switch } from 'react-router-dom';

import RoutesWithLayout from './RoutesWithLayout';
import { useLogout, useGetPermissions, useAuthState } from '../auth';
import { Ready, useTimeout, useSafeSetState } from '../util';

const CoreAdminRouter = props => {
  const getPermissions = useGetPermissions();
  const doLogout = useLogout();
  const { authenticated } = useAuthState();
  const oneSecondHasPassed = useTimeout(1000);
  const [ computedChildren, setComputedChildren ] = useSafeSetState([]);
  useEffect(() => {
    if (typeof props.children === 'function') {
      initializeResources();
    }
  }, [ authenticated ]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeResources = async () => {
    try {
      const permissions = await getPermissions();
      const resolveChildren = props.children;

      const childrenFuncResult = resolveChildren(permissions);
      setComputedChildren(
        childrenFuncResult.filter(child => child)
      );
    } catch (error) {
      console.error(error);
      doLogout();
    }
  };

  const {
    layout,
    catchAll,
    children,
    dashboard,
    loading,
    logout,
    menu,
    theme,
    title,
  } = props;

  if (
    process.env.NODE_ENV !== 'production' &&
    typeof children !== 'function' &&
    !children
  ) {
    return <Ready />;
  }

  if (
    typeof children === 'function' &&
    (!computedChildren || computedChildren.length === 0)
  ) {
    if (oneSecondHasPassed) {
      return <Route path="/" key="loading" component={loading} />;
    } else {
      return null;
    }
  }

  const childrenToRender = typeof children === 'function'
    ? computedChildren
    : children;

  return (
    <div>
      {// Render every resources children outside the React Router Switch
        // as we need all of them and not just the one rendered
        Children.map(
          childrenToRender,
          child =>
            cloneElement(child, {
              key: child.props.name,
              // The context prop instructs the Resource component to not render anything
              // but simply to register itself as a known resource
              intent: 'registration',
            })
        )}
      <Switch>
        <Route
          path="/"
          render={() =>
            createElement(
              layout,
              {
                dashboard,
                logout,
                menu,
                theme,
                title,
              },
              <RoutesWithLayout
                catchAll={catchAll}
                dashboard={dashboard}
                title={title}
              >
                {Children.map(
                  childrenToRender,
                  child =>
                    cloneElement(child, {
                      key: child.props.name,
                      intent: 'route',
                    })
                )}
              </RoutesWithLayout>
            )
          }
        />
      </Switch>
    </div>
  );
};

export default CoreAdminRouter;
