import { all } from 'redux-saga/effects';
import callback from './callback';
import fetch from './fetch';
import notification from './notification';
import redirection from './redirection';
import refresh from './refresh';

/**
 * @param {Object} dataProvider A Data Provider function
 */
export default (dataProvider) =>
  function* admin() {
    yield all([
      fetch(dataProvider)(),
      redirection(),
      refresh(),
      notification(),
      callback(),
    ]);
  };
