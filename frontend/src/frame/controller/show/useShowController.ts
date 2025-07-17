import { generatePath, useParams } from 'react-router-dom';
import { useResourceContext } from '../../core';
import {
  useGetOne,
  UseGetOneHookValue,
  UseGetOneOptions,
  useRefresh,
} from '../../dataProvider';
import { useRedirect } from '../../routing';
import { ResourceItem, UiRecord } from '../../types';

export const useShowController = <
  RecordType extends UiRecord = any,
  ErrorType = Error,
>(
  props: ShowControllerProps<RecordType, ErrorType> = {}
): ShowControllerResult<RecordType, ErrorType> => {
  const {
    disableAuthentication = true,
    id: propsId,
    queryOptions = {},
  } = props;
  const resource = useResourceContext(props);
  if (!resource) {
    throw new Error(
      `useShowController requires a non-empty resource prop or context`
    );
  }

  const params = useParams();
  let resourcePath = resource.path;
  if (!resourcePath) {
    resourcePath = generatePath(
      (resource.route || resource.name) as string,
      params
    );
    resource.path = resourcePath;
  }

  const redirect = useRedirect();
  const refresh = useRefresh();
  const { id: routeId } = useParams<'id'>();
  if (!routeId && !propsId) {
    throw new Error(
      'useShowController requires an id prop or a route with an /:id? parameter.'
    );
  }
  const id = propsId != null ? propsId : routeId;
  const { meta, ...otherQueryOptions } = queryOptions;

  const {
    data: record,
    error,
    isLoading,
    isFetching,
    isPending,
    refetch,
  } = useGetOne<RecordType, ErrorType>(
    resourcePath,
    { id, meta },
    {
      enabled: disableAuthentication,
      onError: () => {
        console.error('Item not found');
        redirect('list', resourcePath);
        refresh();
      },
      retry: false,
      ...otherQueryOptions,
    }
  );

  const recordId = record?.slug || record?.id;
  if (recordId && recordId != id) {
    throw new Error(
      `useShowController: Fetched record's id/slug attribute (${recordId}) must match the requested 'id' or 'slug' (${id})`
    );
  }

  return {
    error,
    isLoading,
    isFetching,
    isPending,
    record,
    refetch,
    resource,
  } as ShowControllerResult<RecordType, ErrorType>;
};

export interface ShowControllerProps<
  RecordType extends UiRecord = any,
  ErrorType = Error,
> {
  disableAuthentication?: boolean;
  id?: RecordType['id'];
  queryOptions?: UseGetOneOptions<RecordType, ErrorType>;
  resource?: ResourceItem;
}

export interface ShowControllerBaseResult<RecordType extends UiRecord = any> {
  defaultTitle?: string;
  isFetching: boolean;
  isLoading: boolean;
  resource: ResourceItem;
  record?: RecordType;
  refetch: UseGetOneHookValue<RecordType>['refetch'];
}

export interface ShowControllerLoadingResult<RecordType extends UiRecord = any>
  extends ShowControllerBaseResult<RecordType> {
  record: undefined;
  error: null;
  isPending: true;
}
export interface ShowControllerLoadingErrorResult<
  RecordType extends UiRecord = any,
  TError = Error,
> extends ShowControllerBaseResult<RecordType> {
  record: undefined;
  error: TError;
  isPending: false;
}
export interface ShowControllerRefetchErrorResult<
  RecordType extends UiRecord = any,
  TError = Error,
> extends ShowControllerBaseResult<RecordType> {
  record: RecordType;
  error: TError;
  isPending: false;
}
export interface ShowControllerSuccessResult<RecordType extends UiRecord = any>
  extends ShowControllerBaseResult<RecordType> {
  record: RecordType;
  error: null;
  isPending: false;
}

export type ShowControllerResult<
  RecordType extends UiRecord = any,
  ErrorType = Error,
> =
  | ShowControllerLoadingResult<RecordType>
  | ShowControllerLoadingErrorResult<RecordType, ErrorType>
  | ShowControllerRefetchErrorResult<RecordType, ErrorType>
  | ShowControllerSuccessResult<RecordType>;
