import { take, put, call, fork, all, takeLatest } from 'redux-saga/effects';
import { push, replace } from 'connected-react-router';

import ActionTypes from './constants';
import * as actions from './actions';
import request from 'utils/request';

function* preload() {
  try {
    // fromRouter competition, season, round
    const requestUrl = '/api/game/competitions';
    const data = yield call(request, requestUrl);
    const { competitions, selectedCompetition, competitionSeasons, selectedSeason } = data;
    yield put(actions.getCompetitionsComplete(competitions));
    const competitionSlug = selectedCompetition.slug;
    yield put(actions.selectCompetition(competitionSlug));
    yield put(actions.getSeasonsComplete(competitionSlug, competitionSeasons));
    const { record, teams, matches, predictions, rounds, selectedRound } = selectedSeason;
    const seasonId = record.id;
    yield put(actions.selectSeason(seasonId));
    yield put(actions.setSeasonData(seasonId, { teams, matches, predictions, rounds }));
    const roundSlug = selectedRound.slug;
    yield put(actions.selectGameRound(seasonId, roundSlug));
    yield put(actions.preloadComplete());
  } catch (error) {
    //const isPreloading = yield select(state => state.preloading);
    yield put(actions.preloadError(error));
  }
}

function* routeToMatchesPage() {
  //const pathname = yield select(state => state);
  //const query = querySelector(state);
  // const round = +query.round === 1 ? 2 : 1;
  // const search = `?${queryString({ ...query, round })}`;
  // console.log(`competition: ${competitionSlug}, season ${seasonSlug}, round: ${roundSlug}`);
  // const pathname = `/competitions/${competitionSlug}/seasons/${seasonSlug}/matches`;
  // const search = `?${queryString({ round: roundSlug })}`;
  // pathname + search
  yield put(push({ pathname: '/competitions/english-premier-league/seasons/2018-19/matches' }));
}

function* updateToMatchesRoute() {
  yield put(replace({ pathname: '/competitions/english-premier-league/seasons/2018-19/matches' }));
}

function* watchPreload() {
  while (true) {
    yield take(ActionTypes.PRELOAD_START);
    yield call(preload);
  }
}

function* watchPreloadComplete() {
  while (true) {
    yield take(ActionTypes.PRELOAD_COMPLETE);
    yield call(updateToMatchesRoute);
  }
}

function* watchRouteToMatchesPage() {
  yield takeLatest(ActionTypes.ROUTE_TO_MATCHES_PAGE, routeToMatchesPage);
}

export default function* gameSaga() {
  yield all([fork(watchPreload), fork(watchPreloadComplete), fork(watchRouteToMatchesPage)]);
}
