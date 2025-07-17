import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Alternative to useCallback that doesn't update the callback when dependencies change
 *
 * @see https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback
 * @see https://github.com/facebook/react/issues/14099#issuecomment-440013892
 */
export const useEvent = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): ((...args: Args) => Return) => {
  const ref = useRef<(...args: Args) => Return>(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });

  useLayoutEffect(() => {
    ref.current = fn;
  });

  return useCallback((...args: Args) => ref.current(...args), []);
};
