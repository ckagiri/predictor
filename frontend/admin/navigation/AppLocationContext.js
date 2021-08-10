import * as React from 'react';
import { createContext, useCallback, useRef, useState } from 'react';
import { getDeepestLocation } from './getDeepestLocation';
import { ResourceLocationListener } from './ResourceLocationListener';

export const LocationContext = createContext([]);

export const defaultLocation = {
  path: null,
  values: {},
};

/**
 * Wrap our application inside a unique location context.
 */
export const AppLocationContext = ({
  children,
  initialLocation = defaultLocation,
}) => {
  const locations = useRef([]);
  const timeout = useRef(undefined);
  const [location, setLocation] = useState(initialLocation);

  const optimizedSetLocation = useCallback(appLocation => {
    locations.current.push(appLocation);

    if (!timeout.current) {
      timeout.current = setTimeout(() => {
        setLocation(getDeepestLocation(locations.current));
        locations.current = [];
        timeout.current = undefined;
      }, 50);
    }
  }, []);

  return (
    <LocationContext.Provider value={[location, optimizedSetLocation]}>
      <ResourceLocationListener />
      {children}
    </LocationContext.Provider>
  );
};
