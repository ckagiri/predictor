import { useCallback } from 'react';
import { AppLocation } from './AppLocationContext';
import { useAppLocationState } from './useAppLocationState';

type NullableLocation = AppLocation | null;
type LocationMatcher = (path: string) => NullableLocation;

export const useAppLocationMatcher = (): LocationMatcher => {
  const [location] = useAppLocationState();
  return useCallback(
    (path: string): NullableLocation => {
      // Should always match the empty path which is the dashboard
      if (path === '') {
        return location;
      }
      const pathToMatchParts = (location.path || '').split('.');
      const pathParts = path.split('.');

      const isMatch = pathParts.reduce((isMatch, part, index) => {
        if (pathToMatchParts.length - 1 < index) {
          return false;
        }

        return isMatch && part === pathToMatchParts[index];
      }, true);

      return isMatch ? location : null;
    },
    [location]
  );
};
