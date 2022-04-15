import { useEffect, useRef } from 'react';

import { useResourceAppLocation } from './useResourceAppLocation';
import { useAppLocationState } from './useAppLocationState';
import { defaultLocation } from './AppLocationContext';

/**
 * This component acts as a listener on changes in the resource location.
 * When the location of the resource changes, it modifies the location of the application accordingly.
 */
export const ResourceLocationListener = () => {
  const [, setLocation] = useAppLocationState();
  const resourceLocation = useResourceAppLocation();
  const currentResourceLocation = useRef(undefined);

  useEffect(() => {
    const { path, values } = resourceLocation || defaultLocation;
    if (resourceLocation) {
      setLocation(path, values);
    } else if (currentResourceLocation.current) {
      // Reset the location state if the users navigated away from a resource page
      setLocation(null);
    }
    currentResourceLocation.current = resourceLocation;
  }, [JSON.stringify(resourceLocation)]);

  return null;
};
