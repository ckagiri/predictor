import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';

import { ModuleState as AppState } from 'components/app/types';
import { ModuleState as GameState } from 'components/competitions/types';

export interface LifeStore extends Store {
  injectedReducers: any;
  injectedSagas: any;
  runSaga(
    saga: (() => IterableIterator<any>) | undefined,
    args: any | undefined,
  ): any;
}

export interface InjectReducerParams {
  key: keyof ApplicationRootState;
  reducer: Reducer<any, any>;
}

export interface InjectSagaParams {
  key: keyof ApplicationRootState;
  saga: () => IterableIterator<any>;
  mode?: string | undefined;
}

export interface ApplicationRootState {
  readonly router: RouterState;
  readonly global: AppState;
  readonly game: GameState;
  // for testing purposes
  readonly test: any;
}
