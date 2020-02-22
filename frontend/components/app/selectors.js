import { createSelector } from 'reselect';
import { ApplicationRootState } from 'types';

const selectGlobal = state => {
  return state.global;
};

const selectRoute = state => {
  return state.router;
};

const makeSelectCurrentUser = () =>
  createSelector(selectGlobal, globalState => globalState.currentUser);

const makeSelectLoading = () =>
  createSelector(selectGlobal, globalState => globalState.loading);

const makeSelectError = () =>
  createSelector(selectGlobal, globalState => globalState.error);

const makeSelectLocation = () =>
  createSelector(selectRoute, routeState => routeState.location);

export {
  selectGlobal,
  makeSelectCurrentUser,
  makeSelectLoading,
  makeSelectError,
  makeSelectLocation,
};
