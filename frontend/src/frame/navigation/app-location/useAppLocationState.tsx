import { useCallback, useContext } from "react";
import { AppLocation, LocationContext } from "./AppLocationContext";

export type AppLocationState = [AppLocation, SetAppLocation];
export type SetAppLocation = (path: string | null, values?: any) => void;

export const useAppLocationState = (): AppLocationState => {
  const locationContext = useContext(LocationContext);

  if (!locationContext) {
    throw new Error(
      `
        You've tried to access app location outside <AppLocationContext />.
        Please wrap your code with it first.
      `
    );
  }

  const [location, setLocation] = locationContext;
  if (typeof setLocation !== "function") {
    throw new Error(
      `
        You've tried to access app location outside <AppLocationContext />.
        Please wrap your code with it first.
      `
    );
  }

  const setAppLocation = useCallback(
    (path: string | null = null, values = {}): void => {
      setLocation({ path, values });
    },
    [setLocation]
  );

  return [location, setAppLocation];
};
