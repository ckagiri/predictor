import React, { createElement } from 'react';
import { Switch, Route } from 'react-router-dom';

import CoreAdminRouter from './CoreAdminRouter';

const DefaultLayout = ({ children }) => <>{children}</>;

const CoreAdminUI = ({
  catchAll = Noop,
  children,
  customRoutes = [],
  dashboard,
  loading = Noop,
  theme,
  title = 'React Admin',
}) => {
  return (
    <Switch>
      <Route
        path="/"
        render={props => (
          <CoreAdminRouter
            catchAll={catchAll}
            customRoutes={customRoutes}
            loading={loading}
            theme={theme}
            title={title}
            {...props}
          >
            {children}
          </CoreAdminRouter>
        )}
      />
    </Switch>
  );
};

const Noop = () => null;

export default CoreAdminUI;
