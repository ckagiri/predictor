import {
  fetchActionsWithRecordResponse,
  fetchActionsWithArrayOfIdentifiedRecordsResponse,
  fetchActionsWithArrayOfRecordsResponse,
  fetchActionsWithTotalResponse,
} from './dataFetchActions';

function validateResponseFormat(
  response: any,
  type: string,
  logger = console.error
) {
  const DATA_PROVIDER_ERROR =
    'DataProvider error. Check the console for details.';
  if (!response) {
    logger(`The dataProvider returned an empty response for '${type}'.`);
    throw new Error(DATA_PROVIDER_ERROR);
  }
  if (!Object.prototype.hasOwnProperty.call(response, 'data')) {
    logger(
      `The response to '${type}' must be like { data: ... }, but the received response does not have a 'data' key. The dataProvider is probably wrong for '${type}'.`
    );
    throw new Error(DATA_PROVIDER_ERROR);
  }
  if (
    fetchActionsWithArrayOfRecordsResponse.includes(type) &&
    !Array.isArray(response.data)
  ) {
    logger(
      `The response to '${type}' must be like { data : [...] }, but the received data is not an array. The dataProvider is probably wrong for '${type}'`
    );
    throw new Error(DATA_PROVIDER_ERROR);
  }
  if (
    fetchActionsWithArrayOfIdentifiedRecordsResponse.includes(type) &&
    Array.isArray(response.data) &&
    response.data.length > 0 &&
    !Object.prototype.hasOwnProperty.call(response.data[0], 'id')
  ) {
    logger(
      `The response to '${type}' must be like { data : [{ id: 123, ...}, ...] }, but the received data items do not have an 'id' key. The dataProvider is probably wrong for '${type}'`
    );
    throw new Error(DATA_PROVIDER_ERROR);
  }
  if (
    fetchActionsWithRecordResponse.includes(type) &&
    !Object.prototype.hasOwnProperty.call(response.data, 'id')
  ) {
    logger(
      `The response to '${type}' must be like { data: { id: 123, ... } }, but the received data does not have an 'id' key. The dataProvider is probably wrong for '${type}'`
    );
    throw new Error(DATA_PROVIDER_ERROR);
  }
  if (
    fetchActionsWithTotalResponse.includes(type) &&
    !Object.prototype.hasOwnProperty.call(response, 'total') &&
    !Object.prototype.hasOwnProperty.call(response, 'pageInfo')
  ) {
    logger(
      `The response to '${type}' must be like  { data: [...], total: 123 }, but the received response does not have a 'total' key. The dataProvider is probably wrong for '${type}'`
    );
    throw new Error(DATA_PROVIDER_ERROR);
  }
}

export default validateResponseFormat;
