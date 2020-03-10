import { take, put, call, fork, all, takeLatest } from 'redux-saga/effects';
import { push, replace } from 'connected-react-router';

import request from 'utils/request';
import { PRIME_START, PRIME_COMPLETE, LOAD_MATCHES_PAGE } from './constants';
import * as actions from './actions';

function* prime() {
  try {
    // fromRouter competition, season, round
    const requestUrl = '/api/game';
    const data = yield call(request, requestUrl);
    const {
      competitions,
      selectedCompetition,
      competitionSeasons,
      selectedSeason,
    } = data;
    yield put(actions.getCompetitionsComplete(competitions));
    const competitionSlug = selectedCompetition.slug;
    yield put(actions.selectCompetition(competitionSlug));
    yield put(actions.getSeasonsComplete(competitionSlug, competitionSeasons));
    const { record, teams, matches, predictions } = selectedSeason;
    const { id: seasonId, currentGameRound } = record;
    yield put(actions.setSeasonData(seasonId, { teams, matches, predictions }));
    yield put(actions.selectSeason(seasonId));
    yield put(actions.selectGameRound(currentGameRound));
    yield put(actions.primeComplete());
  } catch (error) {
    yield put(actions.primeError(error));
  }
}

function* loadMatchesPage() {
  // const pathname = yield select(state => state);
  // const query = querySelector(state);
  // const round = +query.round === 1 ? 2 : 1;
  // const search = `?${queryString({ ...query, round })}`;
  // console.log(`competition: ${competitionSlug}, season ${seasonSlug}, round: ${roundSlug}`);
  // const pathname = `/competitions/${competitionSlug}/seasons/${seasonSlug}/matches`;
  // const search = `?${queryString({ round: roundSlug })}`;
  // pathname + search
  yield put(
    push({
      pathname: '/competitions/english-premier-league/seasons/2018-19/matches',
    }),
  );
}

function* replaceUrlWithMatchesUrl() {
  yield put(
    replace({
      pathname: '/competitions/english-premier-league/seasons/2018-19/matches',
    }),
  );
}

function* watchPrime() {
  while (true) {
    yield take(PRIME_START);
    yield call(prime);
  }
}

function* watchPrimeComplete() {
  while (true) {
    yield take(PRIME_COMPLETE);
    yield call(replaceUrlWithMatchesUrl);
  }
}

function* watchLoadMatchesPage() {
  yield takeLatest(LOAD_MATCHES_PAGE, loadMatchesPage);
}

export default function* gameSaga() {
  yield all([
    fork(watchPrime),
    fork(watchPrimeComplete),
    fork(watchLoadMatchesPage),
  ]);
}
