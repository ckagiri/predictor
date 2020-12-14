import React, { Children, cloneElement } from 'react';
import { Route, Switch } from 'react-router-dom';

import RoutesWithLayout from './RoutesWithLayout';
import { Ready } from '../util';

const CoreAdminRouter = props => {
  const {
    catchAll,
    children,
    customRoutes,
    title,
  } = props;

  if (
    process.env.NODE_ENV !== 'production' && !children
  ) {
    return <Ready />;
  }

  const renderCustomRoutes = (route, routeProps) => {
    if (route.props.render) {
      return route.props.render({
        ...routeProps,
        title: props.title,
      });
    }
    if (route.props.component) {
      return createElement(route.props.component, {
        ...routeProps,
        title: props.title,
      });
    }
  };

  return (
    <div>
      {
        // Render every resources children outside the React Router Switch
        // as we need all of them and not just the one rendered
        Children.map(children, child =>
          cloneElement(child, {
            key: child.props.name,
            // The context prop instructs the Resource component to not render anything
            // but simply to register itself as a known resource
            intent: 'registration',
          }),
        )}
      <Switch>
        {Children.map(children, (child) => (
          <Route
            key={child.props.name}
            path={`/${child.props.name}`}
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
      </Switch>
    </div>
  );
};

export default CoreAdminRouter;
