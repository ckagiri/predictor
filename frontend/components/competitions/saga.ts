import { take, put, call, fork, all, takeLatest } from 'redux-saga/effects';
import { push, replace } from 'connected-react-router';

import ActionTypes from './constants';
import * as actions from './actions';
import request from 'utils/request';

function* prime() {
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
    yield put(actions.primeComplete());
  } catch (error) {
    //const isPriming = yield select(state => state.priming);
    yield put(actions.primeError(error));
  }
}

function* loadMatchesPage() {
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

function* replaceUrlWithMatchesUrl() {
  yield put(replace({ pathname: '/competitions/english-premier-league/seasons/2018-19/matches' }));
}

function* watchPrime() {
  while (true) {
    yield take(ActionTypes.PRIME_START);
    yield call(prime);
  }
}

function* watchPrimeComplete() {
  while (true) {
    yield take(ActionTypes.PRIME_COMPLETE);
    yield call(replaceUrlWithMatchesUrl);
  }
}

function* watchLoadMatchesPage() {
  yield takeLatest(ActionTypes.LOAD_MATCHES_PAGE, loadMatchesPage);
}

export default function* gameSaga() {
  yield all([fork(watchPrime), fork(watchPrimeComplete), fork(watchLoadMatchesPage)]);
}
