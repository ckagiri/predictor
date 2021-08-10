import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Typography } from '@material-ui/core';

import { useAppLocationMatcher } from '../useAppLocationMatcher';

const resolveOrReturn = (valueOrFunction, context) =>
  typeof valueOrFunction === 'function'
    ? valueOrFunction(context)
    : valueOrFunction;

/**
 * The <BreadcrumbItem /> is the component used to display the breadcrumb path inside <Breadcrumb />
 *
 * @param {string} name
 * @param {string} path
 * @param {function|string} label
 * @param {function|string} to
 *
 * @see Breadcrumb
 */
export const BreadcrumbItem = props => {
  const locationMatcher = useAppLocationMatcher();

  const { to, name, path, label, children, ...rest } = props;

  const currentPath = `${path ? `${path}` : ''}${name}`;

  const location = locationMatcher(currentPath);
  if (!location) {
    return null;
  }

  const exactMatch = location.path === currentPath;

  const resolvedLabel = resolveOrReturn(label, location.values);
  const resolvedTo = resolveOrReturn(to, location.values);

  return (
    <>
      <li key={name} {...rest}>
        {resolvedTo && !exactMatch ? (
          <Link
            variant="body2"
            color="inherit"
            component={RouterLink}
            to={resolvedTo}
          >
            {resolvedLabel}
          </Link>
        ) : (
          <Typography variant="body2" color="inherit" component="span">
            {resolvedLabel}
          </Typography>
        )}
      </li>
    </>
  );
};
