import { useCallback } from 'react';

import { useAppLocationState } from './useAppLocationState';

/**
 * Hook returning a function that checks if the path argument matches the current location in the context
 * The app must be inside a AppLocationContext.
 *
 * @see AppLocationContext
 *
 * @example
 *
 *  const MatchAdvertiser = () => {
 *    const match = useAppLocationMatcher();
 *
 *    return (
 *      <>
 *        {match('posts') && <h1>You're on the Posts...</h1>}
 *        {match('posts.list) && <h2>Moreover it's the Posts List!</h2>}
 *      </>
 *    );
 *  );
 *
 * The page title will only show "You're on the Posts..." on Post Edit page.
 * It'll show both "You're on the Posts..." and "Moreover it's the Posts List!" on Post List page.
 */
export const useAppLocationMatcher = () => {
  const [location] = useAppLocationState();
  return useCallback(
    path => ((location.path || '').startsWith(path) ? location : null),
    [location],
  );
};
