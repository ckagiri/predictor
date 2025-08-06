import { Link as RouterLink, To } from 'react-router-dom';
import { Link, styled, SxProps, Typography } from '@mui/material';
import {
  BreadcrumbItemContextProvider,
  useAppLocationMatcher,
  useBreadcrumbItemPath,
} from '../../frame';
import { HTMLAttributes } from 'react';

export type GetLabelFunction = (
  context: Record<string, unknown>
) => string | React.ReactNode;

export type GetToFunction = (
  context: Record<string, unknown>
) => string | To | undefined;

export type BreadcrumbPath = {
  label: string | React.ReactNode | GetLabelFunction;
  to?: string | To | GetToFunction;
};
export interface BreadcrumbItemProps
  extends BreadcrumbPath,
    HTMLAttributes<HTMLLIElement> {
  name: string;
  path?: string;
  sx?: SxProps;
}

const resolveOrReturn = (valueOrFunction: any, context: any): any =>
  typeof valueOrFunction === 'function'
    ? valueOrFunction(context)
    : valueOrFunction;

export const BreadcrumbItem = (props: BreadcrumbItemProps) => {
  const locationMatcher = useAppLocationMatcher();

  const { to, name, label, children, ...rest } = props;
  const path = useBreadcrumbItemPath(props);

  const currentPath = `${path ? `${path}.` : ''}${name}`;

  const location = locationMatcher(currentPath);
  if (!location) {
    return null;
  }

  const exactMatch = location.path === currentPath;

  const resolvedLabel: string | React.ReactNode = resolveOrReturn(
    label,
    location.values
  );
  const labelIsString = typeof resolvedLabel === 'string';
  const resolvedTo: string | To = resolveOrReturn(to, location.values);

  return (
    <>
      <Root key={name} {...rest}>
        {resolvedTo && !exactMatch ? (
          <Link
            variant="body2"
            color="inherit"
            component={RouterLink}
            to={resolvedTo}
          >
            {resolvedLabel}
          </Link>
        ) : labelIsString ? (
          <Typography variant="body2" color="inherit" component="span">
            {resolvedLabel}
          </Typography>
        ) : (
          resolvedLabel
        )}
      </Root>
      <BreadcrumbItemContextProvider path={currentPath}>
        {children}
      </BreadcrumbItemContextProvider>
    </>
  );
};

const Root = styled('li', {
  name: 'UiBreadcrumbItem',
  overridesResolver: (props, styles) => styles.root,
})({});
