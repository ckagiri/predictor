import data from './data';
import list from './list';

const initialState = {};

export default (previousState = initialState, action) => {
  if (!action.meta || !action.meta.resource) {
    return previousState;
  }

  const resources = Object.keys(previousState);
  const newState = resources.reduce(
    (acc, resource) => ({
      ...acc,
      [resource]:
        action.meta.resource === resource
          ? {
              data: data(previousState[resource].data, action),
              list: list(previousState[resource].list, action),
            }
          : previousState[resource],
    }),
    {},
  );

  return newState;
};
