export const GET_LIST = 'GET_LIST';
export const GET_ONE = 'GET_ONE';
export const UPDATE = 'UPDATE';

export const fetchActionsWithRecordResponse = [GET_ONE, UPDATE];
export const fetchActionsWithArrayOfIdentifiedRecordsResponse = [
  GET_LIST,
];

export const fetchActionsWithTotalResponse = [GET_LIST];

export const sanitizeFetchType = fetchType => {
  switch (fetchType) {
    case GET_LIST:
      return 'getList';
    case GET_ONE:
      return 'getOne';
    case UPDATE:
      return 'update';
    default:
      return fetchType;
  }
};
