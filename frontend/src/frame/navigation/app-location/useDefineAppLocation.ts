import { useEffect } from 'react';
import { useAppLocationState } from './useAppLocationState';

export const useDefineAppLocation = (path: string, values?: any): void => {
  const [_, setLocation] = useAppLocationState();

  useEffect(() => {
    if (setLocation) {
      setLocation(path, values);
    }
    return () => {
      if (setLocation) {
        setLocation(null);
      }
    };
  }, [JSON.stringify({ path, values })]); // eslint-disable-line
};
