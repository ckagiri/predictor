import {
  useMediaQuery,
  Theme,
  Tooltip,
  IconButton,
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from '@mui/material';
import {
  ComponentsOverrides,
  styled,
  useThemeProps,
} from '@mui/material/styles';
import { Path, To } from 'react-router';

export const Button = <RootComponent extends React.ElementType = 'button'>(
  inProps: ButtonProps<RootComponent>
) => {
  const props = useThemeProps({ props: inProps, name: PREFIX });
  const {
    alignIcon = 'left',
    children,
    className,
    disabled,
    label,
    color = 'primary',
    size = 'small',
    to: locationDescriptor,
    ...rest
  } = props;

  const linkParams = getLinkParams(locationDescriptor);

  // const isXSmall = useMediaQuery((theme: Theme) =>
  //     theme.breakpoints.down('sm')
  // );
  const isXSmall = false;

  return isXSmall ? (
    label && !disabled ? (
      <Tooltip title={label}>
        <IconButton
          aria-label={label}
          className={className}
          color={color}
          size="large"
          {...linkParams}
          {...rest}
        >
          {children}
        </IconButton>
      </Tooltip>
    ) : (
      <IconButton
        className={className}
        color={color}
        disabled={disabled}
        size="large"
        {...linkParams}
        {...rest}
      >
        {children}
      </IconButton>
    )
  ) : (
    <StyledButton
      className={className}
      color={color}
      size={size}
      aria-label={label}
      disabled={disabled}
      startIcon={alignIcon === 'left' && children ? children : undefined}
      endIcon={alignIcon === 'right' && children ? children : undefined}
      {...linkParams}
      {...rest}
    >
      {label}
    </StyledButton>
  );
};

interface Props<RootComponent extends React.ElementType> {
  alignIcon?: 'left' | 'right';
  children?: React.ReactNode;
  className?: string;
  component?: RootComponent;
  to?: LocationDescriptor | To;
  disabled?: boolean;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: string;
}

export type ButtonProps<RootComponent extends React.ElementType = 'button'> =
  Props<RootComponent> & MuiButtonProps<RootComponent>;

const PREFIX = 'UiButton';

const StyledButton = styled(MuiButton, {
  name: PREFIX,
  overridesResolver: (props, styles) => styles.root,
})({
  '&.MuiButton-sizeSmall': {
    // fix for icon misalignment on small buttons, see https://github.com/mui/material-ui/pull/30240
    lineHeight: 1.5,
  },
});

const getLinkParams = (locationDescriptor?: LocationDescriptor | string) => {
  if (locationDescriptor == undefined) {
    return undefined;
  }

  if (typeof locationDescriptor === 'string') {
    return { to: locationDescriptor };
  }

  const { redirect, replace, state, ...to } = locationDescriptor;
  return {
    to,
    redirect,
    replace,
    state,
  };
};

export type LocationDescriptor = Partial<Path> & {
  redirect?: boolean;
  state?: any;
  replace?: boolean;
};

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey {
    UiButton: 'root';
  }

  interface ComponentsPropsList {
    UiButton: Partial<ButtonProps>;
  }

  interface Components {
    UiButton?: {
      defaultProps?: ComponentsPropsList['UiButton'];
      styleOverrides?: ComponentsOverrides<
        Omit<Theme, 'components'>
      >['UiButton'];
    };
  }
}
