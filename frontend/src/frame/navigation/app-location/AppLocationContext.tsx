import { createContext, ReactElement, ReactNode, useState } from 'react';
import { useResourceAppLocation } from './useResourceAppLocation';

export type LocationState = [AppLocation, SetLocation];
type SetLocation = (path: AppLocation | null) => void;
export const LocationContext = createContext<LocationState | null>(null);

export type AppLocation = { path: string | null; values?: any };

export const defaultLocation = {
  path: null,
  values: {},
};

type AppLocationContextProps = {
  children: ReactNode;
  /**
   * @internal Only use in tests
   */
  initialLocation?: AppLocation;
};

export const AppLocationContext = ({
  children,
  initialLocation,
}: AppLocationContextProps): ReactElement => {
  const [location, setLocation] = useState<AppLocation | null | undefined>(
    initialLocation
  );
  const resourceLocation = useResourceAppLocation();
  let finalLocation = location?.path ? location : resourceLocation;
  if (!finalLocation?.path) {
    finalLocation = defaultLocation;
  }

  return (
    <LocationContext.Provider value={[finalLocation, setLocation]}>
      {children}
    </LocationContext.Provider>
  );
};
