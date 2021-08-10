import React, { createElement, useMemo } from 'react';
import { Route, Switch } from 'react-router-dom';

const Resource = ({ name, path, list }) => {
  // match tends to change even on the same route ; using memo to avoid an extra render
  return useMemo(() => {
    return (
      <Switch>
        {list && (
          <Route
            path={`/admin${path}`}
            exact
            render={routeProps =>
              createElement(list, {
                path,
                resource: name,
                basePath: routeProps.match.url,
                ...routeProps,
              })
            }
          />
        )}
      </Switch>
    );
  }, [name, path]);
};

export default Resource;
