import { styled, SxProps } from '@mui/material';
import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { useAppLocationState } from '../../frame';
import { BreadcrumbItem } from './BreadcrumbItem';

export const Breadcrumb = ({
  children,
  separator,
  ...props
}: BreadcrumbProps) => {
  const [location] = useAppLocationState();

  if (!location.path) return null;

  return (
    <Root
      aria-label="Breadcrumb"
      // @ts-expect-error separator is not a valid prop for Root, but is needed for custom separator logic
      separator={separator}
      {...props}
    >
      <ul className={BreadcrumbClasses.list}>{children}</ul>
    </Root>
  );
};

Breadcrumb.Item = BreadcrumbItem;

export type BreadcrumbVariant = 'default' | 'actions';

export interface BreadcrumbProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  children?: ReactNode;
  separator?: string | GetSeparatorFunction;
  className?: string;
  sx?: SxProps;
}

type GetSeparatorFunction = () => string;
const separatorResolver = (props: {
  separator?: string | GetSeparatorFunction;
}): string => {
  const { separator } = props || {};
  return typeof separator === 'function'
    ? separator()
    : `"${separator || ' / '}"`;
};

const PREFIX = 'UiBreadcrumb';
const BreadcrumbClasses = {
  list: `${PREFIX}-list`,
};

const Root = styled<'nav'>('nav', {
  name: 'UiBreadcrumb',
  overridesResolver: (props, styles) => styles.root,
})(({ theme, ...props }) => ({
  [`& .${BreadcrumbClasses.list}`]: {
    listStyle: 'none',
    padding: `${theme.spacing(0.5)} 0 ${theme.spacing(0.5)} 0`,
    margin: `${theme.spacing(0.5)} 0 ${theme.spacing(0.5)} 0`,
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
    '&:empty': {
      margin: 0,
    },
    '& li': {
      display: 'flex',
      gap: theme.spacing(1),
      alignItems: 'center',
      color: theme.palette.text.secondary,
      '&+li::before': {
        content: '" / "',
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
}));
