import {
  fetchActionsWithArrayOfIdentifiedRecordsResponse,
  fetchActionsWithTotalResponse,
  fetchActionsWithArrayOfRecordsResponse,
} from '../core';

function validateResponseFormat(
  response,
  type,
  logger = console.error, // eslint-disable-line no-console
) {
  if (!response) {
    logger(`The dataProvider returned an empty response for '${type}'.`);
    throw new Error('dataProvider error. Check the console for details.');
  }
  if (!response.hasOwnProperty('data')) {
    logger(
      `The response to '${type}' must be like { data: ... }, but the received response does not have a 'data' key. The dataProvider is probably wrong for '${type}'.`,
    );
    throw new Error('dataProvider error. Check the console for details.');
  }
  if (
    fetchActionsWithArrayOfRecordsResponse.includes(type) &&
    !Array.isArray(response.data)
  ) {
    logger(
      `The response to '${type}' must be like { data : [...] }, but the received data is not an array. The dataProvider is probably wrong for '${type}'`,
    );
    throw new Error('dataProvider error. Check the console for details.');
  }
  if (
    fetchActionsWithArrayOfIdentifiedRecordsResponse.includes(type) &&
    Array.isArray(response.data) &&
    response.data.length > 0 &&
    !response.data[0].hasOwnProperty('id')
  ) {
    logger(
      `The response to '${type}' must be like { data : [{ id: 123, ...}, ...] }, but the received data items do not have an 'id' key. The dataProvider is probably wrong for '${type}'`,
    );
    throw new Error('dataProvider error. Check the console for details.');
  }
  if (
    fetchActionsWithTotalResponse.includes(type) &&
    !response.hasOwnProperty('total')
  ) {
    logger(
      `The response to '${type}' must be like  { data: [...], total: 123 }, but the received response does not have a 'total' key. The dataProvider is probably wrong for '${type}'`,
    );
    throw new Error('dataProvider error. Check the console for details.');
  }
}

export default validateResponseFormat;
