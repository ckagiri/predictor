import { put, takeEvery } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import resolveRedirectTo from '../util/resolveRedirectTo';
import { refreshView } from '../actions/uiActions';

/**
 * Redirection Side Effects
 */
export function* handleRedirection({
  payload,
  requestPayload,
  meta: { basePath, redirectTo },
}) {
  if (!redirectTo) {
    yield put(refreshView());
    return;
  }

  yield put(
    push(
      resolveRedirectTo(
        redirectTo,
        basePath,
        payload
          ? payload.id || (payload.data ? payload.data.id : null)
          : requestPayload
            ? requestPayload.id
            : null,
        payload && payload.data
          ? payload.data
          : requestPayload && requestPayload.data
            ? requestPayload.data
            : null
      )
    )
  );
}

export default function* () {
  yield takeEvery(
    // @ts-ignore
    action => action.meta && typeof action.meta.redirectTo !== 'undefined',
    handleRedirection
  );
}
