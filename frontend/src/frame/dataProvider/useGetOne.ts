import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { GetOneParams, GetOneResult, UiRecord } from '../types';
import { useEvent } from '../util';
import { useDataProvider } from './useDataProvider';
import { useEffect } from 'react';

export const useGetOne = <RecordType extends UiRecord = any, ErrorType = Error>(
  resource: string,
  { id, meta }: Partial<GetOneParams<RecordType>>,
  options: UseGetOneOptions<RecordType, ErrorType> = {}
): UseGetOneHookValue<RecordType, ErrorType> => {
  const dataProvider = useDataProvider();
  const {
    onError = noop,
    onSuccess = noop,
    onSettled = noop,
    enabled,
    ...queryOptions
  } = options;
  const onSuccessEvent = useEvent(onSuccess);
  const onErrorEvent = useEvent(onError);
  const onSettledEvent = useEvent(onSettled);

  const result = useQuery<RecordType, ErrorType>({
    // Sometimes the id comes as a string (e.g. when read from the URL in a Show view).
    // Sometimes the id comes as a number (e.g. when read from a Record in useGetList response).
    // As the react-query cache is type-sensitive, we always stringify the identifier to get a match
    queryKey: [resource, 'getOne', { id: String(id) }],
    queryFn: queryParams =>
      id == null
        ? Promise.reject('useGetOne: id cannot be null')
        : dataProvider
            .getOne<RecordType>(resource, {
              id,
              meta,
              signal:
                dataProvider.supportAbortSignal === true
                  ? queryParams.signal
                  : undefined,
            })
            .then(({ data }) => data),
    enabled: enabled ?? id != null,
    ...queryOptions,
  });

  useEffect(() => {
    if (result.data === undefined || result.error != null || result.isFetching)
      return;
    onSuccessEvent(result.data);
  }, [onSuccessEvent, result.data, result.error, result.isFetching]);

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

  return result;
};

const noop = () => undefined;

export type UseGetOneOptions<
  RecordType extends UiRecord = any,
  ErrorType = Error,
> = Omit<
  UseQueryOptions<GetOneResult<RecordType>['data'], ErrorType>,
  'queryKey' | 'queryFn'
> & {
  onSuccess?: (data: GetOneResult<RecordType>['data']) => void;
  onError?: (error: ErrorType) => void;
  onSettled?: (
    data?: GetOneResult<RecordType>['data'],
    error?: ErrorType | null
  ) => void;
};

export type UseGetOneHookValue<
  RecordType extends UiRecord = any,
  ErrorType = Error,
> = UseQueryResult<GetOneResult<RecordType>['data'], ErrorType>;
