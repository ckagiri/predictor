import { ReactNode } from 'react';
import { UiRecord } from '../../types';
import { OptionalResourceContextProvider } from '../../core';
import { ListContextProvider } from './ListContextProvider';
import { ListControllerProps, useListController } from './useListController';

export const ListBase = <RecordType extends UiRecord = any>({
  children,
  loading = null,
  ...props
}: ListBaseProps<RecordType>) => {
  const controllerProps = useListController<RecordType>(props);

  return (
    // We pass props.resource here as we don't need to create a new ResourceContext if the props is not provided
    <OptionalResourceContextProvider value={props.resource}>
      <ListContextProvider value={controllerProps}>
        {children}
      </ListContextProvider>
    </OptionalResourceContextProvider>
  );
};

export interface ListBaseProps<RecordType extends UiRecord = any>
  extends ListControllerProps<RecordType> {
  children: ReactNode;
  loading?: ReactNode;
}
