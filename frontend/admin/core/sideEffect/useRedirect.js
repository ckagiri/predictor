import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import resolveRedirectTo from '../util/resolveRedirectTo';
import { refreshView } from '../actions/uiActions';
import { useHistory } from 'react-router-dom';

/**
 * Hook for Redirection Side Effect
 *
 * @example
 *
 * const redirect = useRedirect();
 * // redirect to list view
 * redirect('list', '/posts');
 * // redirect to edit view
 * redirect('edit', '/posts', 123);
 * // do not redirect (resets the record form)
 * redirect(false);
 * // redirect to the result of a function
 * redirect((redirectTo, basePath, is, data) => ...)
 */
const useRedirect = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  return useCallback(
    (redirectTo, basePath = '', id, data) => {
      if (!redirectTo) {
        dispatch(refreshView());
        return;
      }

      history.push(resolveRedirectTo(redirectTo, basePath, id, data));
    },
    [dispatch, history],
  );
};

export default useRedirect;
