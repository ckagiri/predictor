export const GET_LIST = 'GET_LIST';
export const GET_MANY_REFERENCE = 'GET_MANY_REFERENCE';

export const fetchActionsWithArrayOfIdentifiedRecordsResponse = [
  'getList',
  'getManyReference',
];

export const fetchActionsWithArrayOfRecordsResponse = [
  ...fetchActionsWithArrayOfIdentifiedRecordsResponse,
];

export const fetchActionsWithTotalResponse = ['getList', 'getManyReference'];

export const sanitizeFetchType = fetchType => {
  switch (fetchType) {
    case GET_LIST:
      return 'getList';
    case GET_MANY_REFERENCE:
      return 'getManyReference';
    default:
      return fetchType;
  }
};
