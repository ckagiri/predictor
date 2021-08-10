import isEqual from 'lodash/isEqual';
import { GET_LIST, GET_MANY_REFERENCE } from '../../core';
import { getFetchedAt } from '../../util';

/**
 * A list of records indexed by id, together with their fetch dates
 *
 * Note that the fetchedAt property isn't enumerable.
 *
 * @example
 * {
 *      12: { id: 12, title: "hello" },
 *      34: { id: 34, title: "world" },
 *      fetchedAt: {
 *          12: new Date('2019-02-06T21:23:07.049Z'),
 *          34: new Date('2019-02-06T21:23:07.049Z'),
 *      }
 * }
 */

/**
 * Make the fetchedAt property non enumerable
 */
export const hideFetchedAt = records => {
  Object.defineProperty(records, 'fetchedAt', {
    enumerable: false,
    configurable: false,
    writable: false,
  });
  return records;
};

/**
 * Add new records to the pool, and remove outdated ones.
 *
 * This is the equivalent of a stale-while-revalidate caching strategy:
 * The cached data is displayed before fetching, and stale data is removed
 * only once fresh data is fetched.
 */
export const addRecordsAndRemoveOutdated = (newRecords = [], oldRecords) => {
  const newRecordsById = {};
  newRecords.forEach(record => (newRecordsById[record.id] = record));

  const newFetchedAt = getFetchedAt(
    newRecords.map(({ id }) => id),
    oldRecords.fetchedAt,
  );

  const records = { fetchedAt: newFetchedAt };
  Object.keys(newFetchedAt).forEach(
    id =>
      (records[id] = newRecordsById[id]
        ? isEqual(newRecordsById[id], oldRecords[id])
          ? oldRecords[id] // do not change the record to avoid a redraw
          : newRecordsById[id]
        : oldRecords[id]),
  );

  return hideFetchedAt(records);
};

/**
 * Add new records to the pool, without touching the other ones.
 */
export const addRecords = (newRecords, oldRecords) => {
  const newRecordsById = { ...oldRecords };
  newRecords.forEach(record => {
    newRecordsById[record.id] = isEqual(record, oldRecords[record.id])
      ? oldRecords[record.id]
      : record;
  });

  const updatedFetchedAt = getFetchedAt(
    newRecords.map(({ id }) => id),
    oldRecords.fetchedAt,
  );

  Object.defineProperty(newRecordsById, 'fetchedAt', {
    value: { ...oldRecords.fetchedAt, ...updatedFetchedAt },
    enumerable: false,
  });

  return newRecordsById;
};

const initialState = hideFetchedAt({ fetchedAt: {} });

const dataReducer = (previousState = initialState, { payload, meta }) => {
  if (!meta || !meta.fetchResponse) {
    return previousState;
  }

  switch (meta.fetchResponse) {
    case GET_LIST:
      return addRecordsAndRemoveOutdated(payload.data, previousState);
    case GET_MANY_REFERENCE:
      return addRecords(payload.data, previousState);
    default:
      return previousState;
  }
};

export const getRecord = (state, id) => state[id];

export default dataReducer;
