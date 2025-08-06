import {
  ComponentsOverrides,
  styled,
  useThemeProps,
  Theme,
} from '@mui/material';
import {
  ResourceItem,
  UiRecord,
  useCreatePath,
  useRecordContext,
  useResourceContext,
} from '../../frame';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import ContentCreate from '@mui/icons-material/Create';
import { ReactNode } from 'react';
import { Button, ButtonProps } from './Button';

export const EditButton = <RecordType extends UiRecord = any>(
  inProps: EditButtonProps<RecordType>
) => {
  const props = useThemeProps({
    props: inProps,
    name: PREFIX,
  });
  const {
    icon = defaultIcon,
    label = 'Edit',
    scrollToTop = true,
    className,
    ...rest
  } = props;
  const resource = useResourceContext(props);
  if (!resource) {
    throw new Error(
      '<EditButton> components should be used inside a <Resource> component or provided with a resource prop. (The <Resource> component set the resource prop for all its children).'
    );
  }
  const record = useRecordContext(props);
  const createPath = useCreatePath();
  if (!record) return null;
  return (
    <StyledButton
      component={Link}
      to={createPath({
        type: 'edit',
        resource: resource.path,
        id: record.slug || record.id,
      })}
      state={scrollStates[String(scrollToTop)]}
      label={label}
      onClick={stopPropagation}
      className={clsx(EditButtonClasses.root, className)}
      {...(rest as any)}
    >
      {icon}
    </StyledButton>
  );
};

// avoids using useMemo to get a constant value for the link state
const scrollStates = {
  true: { _scrollToTop: true },
  false: {},
} as any;

const defaultIcon = <ContentCreate />;

// useful to prevent click bubbling in a datatable with rowClick
const stopPropagation = (e: { stopPropagation: () => any }) =>
  e.stopPropagation();

interface Props<RecordType extends UiRecord = any> {
  icon?: ReactNode;
  label?: string;
  record?: RecordType;
  resource?: ResourceItem;
  scrollToTop?: boolean;
}

export type EditButtonProps<RecordType extends UiRecord = any> =
  Props<RecordType> & ButtonProps;

const PREFIX = 'UiEditButton';

export const EditButtonClasses = {
  root: `${PREFIX}-root`,
};

const StyledButton = styled(Button, {
  name: PREFIX,
  overridesResolver: (_props, styles) => styles.root,
})({});

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey {
    UiEditButton: 'root';
  }

  interface ComponentsPropsList {
    UiEditButton: Partial<EditButtonProps>;
  }

  interface Components {
    UiEditButton?: {
      defaultProps?: ComponentsPropsList['UiEditButton'];
      styleOverrides?: ComponentsOverrides<
        Omit<Theme, 'components'>
      >['UiEditButton'];
    };
  }
}
