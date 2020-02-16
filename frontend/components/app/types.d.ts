import { ActionType } from 'typesafe-actions';
import { ApplicationRootState } from 'types';

interface AppState {
  readonly loading: boolean;
  readonly error: object | boolean;
  readonly currentUser: string;
}

/* --- EXPORTS --- */
type RootState = ApplicationRootState;
type ModuleState = AppState;

export { RootState, ModuleState };
