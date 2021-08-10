import React from 'react';
import { makeStyles } from '@material-ui/core';
import classnames from 'classnames';
import { useAppLocationState } from '../useAppLocationState';

export const Breadcrumb = ({ children, className, variant, ...props }) => {
  const [location] = useAppLocationState();
  const classes = useStyles(props);

  if (!location.path) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={classnames(className, {
        [classes.actions]: variant === 'actions',
      })}
    >
      <ul className={classes.root}>
        {React.Children.map(children, child => React.cloneElement(child))}
      </ul>
    </nav>
  );
};

const separatorResolver = ({ separator }) =>
  typeof separator === 'function' ? separator() : `"${separator || '/'}"`;

const useStyles = makeStyles(
  theme => ({
    root: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      '& li': {
        display: 'inline',
        color: theme.palette.text.secondary,
        '&+li::before': {
          content: separatorResolver,
          padding: `0 ${theme.spacing(1)}px`,
        },
        '&+li:last-child': {
          color: theme.palette.text.primary,
        },
        '& a': {
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
    actions: {
      // Same padding as the MuiButton with small text
      padding: '4px 5px',
      // Ensure the breadcrumb is at the left of the view
      marginRight: 'auto',
    },
  }),
  { name: 'Breadcrumb' },
);
