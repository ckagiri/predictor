import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { GetListParams, GetListResult, UiRecord } from '../types';
import { useEffect, useMemo, useRef } from 'react';
import { useDataProvider } from './useDataProvider';
import { useEvent } from '../util';

const MAX_DATA_LENGTH_TO_CACHE = 100;

export const useGetList = <
  RecordType extends UiRecord = any,
  ErrorType = Error,
>(
  resource: string,
  params: Partial<GetListParams> = {},
  options: UseGetListOptions<RecordType, ErrorType> = {}
): UseGetListHookValue<RecordType> => {
  const { pagination = { page: 1, perPage: 25 }, sort, filter, meta } = params;
  const dataProvider = useDataProvider();
  const queryClient = useQueryClient();
  const {
    onError = noop,
    onSuccess = noop,
    onSettled = noop,
    ...queryOptions
  } = options;
  const onSuccessEvent = useEvent(onSuccess);
  const onErrorEvent = useEvent(onError);
  const onSettledEvent = useEvent(onSettled);

  const result = useQuery<
    GetListResult<RecordType>,
    ErrorType,
    GetListResult<RecordType>
  >({
    queryKey: [resource, 'getList', { pagination, sort, filter, meta }],
    queryFn: queryParams =>
      dataProvider
        .getList<RecordType>(resource, {
          pagination,
          sort,
          filter,
          meta,
          signal:
            dataProvider.supportAbortSignal === true
              ? queryParams.signal
              : undefined,
        })
        .then(({ data, total, pageInfo, meta }) => ({
          data,
          total,
          pageInfo,
          meta,
        })),
    ...queryOptions,
  });

  const metaValue = useRef(meta);
  const resourceValue = useRef(resource);

  useEffect(() => {
    metaValue.current = meta;
  }, [meta]);

  useEffect(() => {
    resourceValue.current = resource;
  }, [resource]);

  useEffect(() => {
    if (result.data === undefined || result.error != null || result.isFetching)
      return;

    // optimistically populate the getOne cache
    if (
      result.data?.data &&
      result.data.data.length <= MAX_DATA_LENGTH_TO_CACHE
    ) {
      result.data.data.forEach(record => {
        const recordId = record.slug ?? String(record.id);
        queryClient.setQueryData(
          [resourceValue.current, 'getOne', { id: recordId }],
          oldRecord => {
            return oldRecord ?? record;
          }
        );
      });
    }
    onSuccessEvent(result.data);
  }, [
    onSuccessEvent,
    queryClient,
    result.data,
    result.error,
    result.isFetching,
  ]);

  useEffect(() => {
    if (result.error == null || result.isFetching) return;
    onErrorEvent(result.error);
  }, [onErrorEvent, result.error, result.isFetching]);

  useEffect(() => {
    if (result.status === 'pending' || result.isFetching) return;
    onSettledEvent(result.data, result.error);
  }, [
    onSettledEvent,
    result.data,
    result.error,
    result.status,
    result.isFetching,
  ]);

  return useMemo(
    () =>
      result.data
        ? {
            ...result,
            ...result.data,
          }
        : result,
    [result]
  ) as unknown as UseQueryResult<RecordType[], Error> & {
    total?: number;
    pageInfo?: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    };
    meta?: any;
  };
};

const noop = () => undefined;

export type UseGetListOptions<
  RecordType extends UiRecord = any,
  ErrorType = Error,
> = Omit<
  UseQueryOptions<GetListResult<RecordType>, ErrorType>,
  'queryKey' | 'queryFn'
> & {
  onSuccess?: (value: GetListResult<RecordType>) => void;
  onError?: (error: ErrorType) => void;
  onSettled?: (
    data?: GetListResult<RecordType>,
    error?: ErrorType | null
  ) => void;
};

export type UseGetListHookValue<RecordType extends UiRecord = any> =
  UseQueryResult<RecordType[], Error> & {
    total?: number;
    pageInfo?: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    };
    meta?: any;
  };
