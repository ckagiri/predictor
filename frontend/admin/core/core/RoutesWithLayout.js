import React, { Children, cloneElement, createElement } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import WithPermissions from '../auth/WithPermissions';

const RoutesWithLayout = ({ catchAll, children, dashboard, title }) => {
  const childrenAsArray = React.Children.toArray(children);
  const firstChild = childrenAsArray.length > 0 ? childrenAsArray[0] : null;

  return (
    <Switch>
      {Children.map(children, child => (
        <Route
          key={child.props.name}
          path={`/${child.props.path ? child.props.path : child.props.name}`}
          render={props =>
            cloneElement(child, {
              // The context prop instruct the Resource component to
              // render itself as a standard component
              intent: 'route',
              ...props,
            })
          }
        />
      ))}
      {firstChild ? (
        <Route
          exact
          path="/"
          render={() => <Redirect to={`/${firstChild.props.name}`} />}
        />
      ) : null}
      <Route
        render={routeProps =>
          createElement(catchAll, {
            ...routeProps,
            title,
          })
        }
      />
    </Switch>
  );
};

export default RoutesWithLayout;
