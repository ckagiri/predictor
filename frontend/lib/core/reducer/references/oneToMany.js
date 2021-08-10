import { CRUD_GET_MANY_REFERENCE_SUCCESS } from '../../actions';

const initialState = {};

const oneToManyReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case CRUD_GET_MANY_REFERENCE_SUCCESS:
      return {
        ...previousState,
        [action.meta.relatedTo]: {
          ids: action.payload.data.map(record => record.id),
          total: action.payload.total,
        },
      };

    default:
      return previousState;
  }
};

export const getIds = (state, relatedTo) =>
  (state.references.oneToMany[relatedTo] &&
    state.references.oneToMany[relatedTo].ids) ||
  null;

export const getTotal = (state, relatedTo) =>
  state.references.oneToMany[relatedTo] &&
  state.references.oneToMany[relatedTo].total;

export const nameRelatedTo = (reference, resource, id) =>
  `${resource}_${reference}@${id}`;

export default oneToManyReducer;
