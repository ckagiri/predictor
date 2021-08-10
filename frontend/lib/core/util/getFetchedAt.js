import pickBy from 'lodash/pickBy';

const defaultCacheDuration = 10 * 60 * 1000; // ten minutes

/**
 * The dates each record was fetched at, index by record identifier
 *
 * @example
 * {
 *      12: new Date('2019-02-06T21:23:07.049Z'),
 *      34: new Date('2019-02-06T21:23:07.049Z'),
 * }
 */

/**
 * Returns a list of fetch dates by record id
 *
 * Given a list of new record ids and a previous list of fetch dates by record id,
 * add the new record ids at the current date,
 * and removes those among the old record ids that are stale.
 *
 * @param newRecordIds an array of record identifiers, e.g. [34, 56]
 * @param oldRecordFetchedAt the fetch dates of old records, e.g. { 12: new Date('12 minutes ago), 34: new Date('5 minutes ago') }
 * @param now Current time (useful for tests)
 * @param cacheDuration How long until an old record is removed from the list
 */
const getFetchedAt = (
  newRecordIds = [],
  oldRecordFetchedAt = {},
  now = new Date(),
  cacheDuration = defaultCacheDuration,
) => {
  // prepare new records and timestamp them
  const newFetchedAt = {};
  newRecordIds.forEach(recordId => (newFetchedAt[recordId] = now));

  // remove outdated entry
  const latestValidDate = new Date();
  latestValidDate.setTime(latestValidDate.getTime() - cacheDuration);

  const stillValidFetchedAt = pickBy(
    oldRecordFetchedAt,
    date => date > latestValidDate,
  );

  return {
    ...stillValidFetchedAt,
    ...newFetchedAt,
  };
};

export default getFetchedAt;
