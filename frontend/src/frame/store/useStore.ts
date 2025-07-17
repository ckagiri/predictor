import { useEffect, useState } from 'react';
import isEqual from 'lodash/isEqual';

import { useStoreContext } from './useStoreContext';
import { useEvent } from '../util';

export const useStore = <T = any>(
  key: string,
  defaultValue?: T
): useStoreResult<T> => {
  const { getItem, setItem, subscribe } = useStoreContext();
  const [value, setValue] = useState(() => getItem(key, defaultValue));

  // subscribe to changes on this key, and change the state when they happen
  useEffect(() => {
    const storedValue = getItem(key, defaultValue);
    if (!isEqual(value, storedValue)) {
      setValue(storedValue);
    }
    const unsubscribe = subscribe(key, newValue => {
      setValue(typeof newValue === 'undefined' ? defaultValue : newValue);
    });
    return () => unsubscribe();
  }, [key, subscribe, defaultValue, getItem, value]);

  const set = useEvent(
    (valueParam: T | ((value: T) => void), runtimeDefaultValue?: T) => {
      let newValue: T | undefined;
      if (typeof valueParam === 'function') {
        // If valueParam is a function, call it with the current value
        // TypeScript doesn't know if valueParam is (value: T) => void or T, so we need to cast
        newValue = (valueParam as (value: T) => T)(value);
      } else {
        newValue = valueParam;
      }
      setItem(
        key,
        typeof newValue === 'undefined'
          ? typeof runtimeDefaultValue === 'undefined'
            ? defaultValue
            : runtimeDefaultValue
          : newValue
      );
    }
  );
  return [value, set];
};

export type useStoreResult<T = any> = [
  T,
  (value: T | ((value: T) => void), defaultValue?: T) => void,
];
