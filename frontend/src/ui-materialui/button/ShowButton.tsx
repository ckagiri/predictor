import { Link } from 'react-router-dom';
import {
  ResourceItem,
  UiRecord,
  useCreatePath,
  useRecordContext,
  useResourceContext,
} from '../../frame';
import { Button, ButtonProps } from './Button';
import { memo } from 'react';
import ImageEye from '@mui/icons-material/RemoveRedEye';

export const ShowButton = <RecordType extends UiRecord = any>(
  props: ShowButtonProps<RecordType>
) => {
  const {
    icon = defaultIcon,
    label = 'Show',
    record: recordProp,
    resource: resourceProp,
    scrollToTop = true,
    ...rest
  } = props;
  const resource = useResourceContext(props);
  if (!resource) {
    throw new Error(
      '<ShowButton> components should be used inside a <Resource> component or provided the resource prop.'
    );
  }
  const record = useRecordContext(props);
  const createPath = useCreatePath();
  if (!record) return null;
  return (
    <Button
      component={Link}
      to={createPath({
        type: 'show',
        resource: resource.path,
        id: record.slug || record.id,
      })}
      state={scrollStates[String(scrollToTop)]}
      label={label}
      onClick={stopPropagation}
      {...(rest as any)}
    >
      {icon}
    </Button>
  );
};

// avoids using useMemo to get a constant value for the link state
const scrollStates = {
  true: { _scrollToTop: true },
  false: {},
} as any;

const defaultIcon = <ImageEye />;

// useful to prevent click bubbling in a datagrid with rowClick
const stopPropagation = (e: { stopPropagation: () => any }) =>
  e.stopPropagation();

interface Props<RecordType extends UiRecord = any> {
  icon?: React.ReactNode;
  label?: string;
  record?: RecordType;
  resource?: ResourceItem;
  scrollToTop?: boolean;
}

export type ShowButtonProps<RecordType extends UiRecord = any> =
  Props<RecordType> & Omit<ButtonProps<typeof Link>, 'to'>;

export const PureShowButton = memo(
  ShowButton,
  (prevProps, nextProps) =>
    prevProps.resource === nextProps.resource &&
    (prevProps.record && nextProps.record
      ? prevProps.record.id === nextProps.record.id
      : prevProps.record == nextProps.record) &&
    prevProps.label === nextProps.label &&
    prevProps.disabled === nextProps.disabled
);

export default PureShowButton;
