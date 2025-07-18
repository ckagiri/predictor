import set from 'lodash/set';
import unset from 'lodash/unset';
import get from 'lodash/get';
import { Store } from './types';

type Subscription = {
  key: string;
  callback: (value: any) => void;
};

export const memoryStore = (storage: any = {}): Store => {
  const subscriptions: { [key: string]: Subscription } = {};
  const publish = (key: string, value: any) => {
    Object.keys(subscriptions).forEach(id => {
      if (!subscriptions[id]) return; // may happen if a component unmounts after a first subscriber was notified
      if (subscriptions[id].key === key) {
        subscriptions[id].callback(value);
      }
    });
  };
  return {
    setup: () => {},
    teardown: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
    getItem<T = any>(key: string, defaultValue?: T): T {
      return get(storage, key, defaultValue);
    },
    setItem<T = any>(key: string, value: T): void {
      set(storage, key, value);
      publish(key, value);
    },
    removeItem(key: string): void {
      unset(storage, key);
      publish(key, undefined);
    },
    removeItems(keyPrefix: string): void {
      const flatStorage = flatten(storage);
      Object.keys(flatStorage).forEach(key => {
        if (!key.startsWith(keyPrefix)) {
          return;
        }
        unset(storage, key);
        publish(key, undefined);
      });
    },
    reset(): void {
      const flatStorage = flatten(storage);
      Object.keys(flatStorage).forEach(key => {
        unset(storage, key);
        publish(key, undefined);
      });
    },
    subscribe: (key: string, callback: (value: string) => void) => {
      const id = Math.random().toString();
      subscriptions[id] = {
        key,
        callback,
      };
      return () => {
        delete subscriptions[id];
      };
    },
  };
};

const flatten = (data: any) => {
  const result: { [key: string]: any } = {};
  function doFlatten(current: { [x: string]: any }, prop: string) {
    if (Object(current) !== current) {
      // scalar value
      result[prop] = current;
    } else if (Array.isArray(current)) {
      // array
      result[prop] = current;
    } else {
      // object
      let isEmpty = true;
      for (const p in current) {
        isEmpty = false;
        doFlatten(current[p], prop ? prop + '.' + p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  }
  doFlatten(data, '');
  return result;
};
