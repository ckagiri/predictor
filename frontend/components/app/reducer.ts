import { ModuleState } from './types';

export const initialState: ModuleState = {
  loading: false,
  error: false,
  currentUser: ''
};

function appReducer(state: ModuleState = initialState): ModuleState {
  return state;
}

export default appReducer;
