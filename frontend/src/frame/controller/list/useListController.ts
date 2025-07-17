import { generatePath, useParams } from 'react-router';
import { useResourceContext } from '../../core';
import { useGetList, UseGetListOptions } from '../../dataProvider';
import { ResourceItem, UiRecord } from '../../types';

export const useListController = <
  RecordType extends UiRecord = any,
  ErrorType = Error,
>(
  props: ListControllerProps<RecordType, ErrorType> = {}
): ListControllerResult<RecordType, ErrorType> => {
  const { queryOptions = {} } = props;
  const resource = useResourceContext(props);
  const { meta, ...otherQueryOptions } = queryOptions;

  if (!resource?.name && !resource?.route && !resource?.path) {
    throw new Error(
      `useListController requires a non-empty resource prop or context`
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

  const { data, total, error, isLoading, isFetching } = useGetList<
    RecordType,
    ErrorType
  >(
    resourcePath,
    {
      meta,
    },
    {
      retry: false,
      onError: (error: any) => console.error(error),
      ...otherQueryOptions,
    }
  );

  return {
    data,
    error,
    isFetching,
    isLoading,
    resource,
    total,
  } as ListControllerResult<RecordType, ErrorType>;
};
export interface ListControllerProps<
  RecordType extends UiRecord = any,
  ErrorType = Error,
> {
  queryOptions?: UseGetListOptions<RecordType, ErrorType>;
  resource?: ResourceItem;
}
export interface ListControllerBaseResult<RecordType extends UiRecord = any> {
  page: number;
  perPage: number;
  resource: ResourceItem;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  isFetching?: boolean;
  isLoading?: boolean;
}

export interface ListControllerLoadingResult<RecordType extends UiRecord = any>
  extends ListControllerBaseResult<RecordType> {
  data: undefined;
  total: undefined;
  meta: undefined;
  error: null;
  isPending: true;
}
export interface ListControllerErrorResult<
  RecordType extends UiRecord = any,
  TError = Error,
> extends ListControllerBaseResult<RecordType> {
  data: undefined;
  total: undefined;
  meta: undefined;
  error: TError;
  isPending: false;
}

export interface ListControllerSuccessResult<RecordType extends UiRecord = any>
  extends ListControllerBaseResult<RecordType> {
  data: RecordType[];
  total: number;
  meta?: any;
  error: null;
  isPending: false;
}

export type ListControllerResult<
  RecordType extends UiRecord = any,
  ErrorType = Error,
> =
  | ListControllerLoadingResult<RecordType>
  | ListControllerErrorResult<RecordType, ErrorType>
  | ListControllerSuccessResult<RecordType>;
