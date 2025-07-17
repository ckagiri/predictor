import { useContext } from 'react';
import { UiRecord } from '../../types';
import { RecordContext } from './RecordContext';

export const useRecordContext = <
  RecordType extends UiRecord | Omit<UiRecord, 'id'> = UiRecord,
>(
  props?: UseRecordContextParams<RecordType>
): RecordType | undefined => {
  // Can't find a way to specify the RecordType when CreateContext is declared
  // @ts-expect-error: RecordContext type cannot be parameterized with RecordType due to context creation constraints
  const context = useContext<RecordType | undefined>(RecordContext);

  return (props && props.record) || context;
};

export interface UseRecordContextParams<
  RecordType extends UiRecord | Omit<UiRecord, 'id'> = UiRecord,
> {
  record?: RecordType;
  [key: string]: any;
}
