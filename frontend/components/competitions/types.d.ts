import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

interface GameState {
  preloaded: boolean;
  preloading: boolean;
  competitions: any;
  selectedCompetition: string | null;
  seasons: any;
  selectedSeason: string | null;
  matches: any;
  predictions: any;
  teams: any;
  gameRounds: any;
  selectedGameRound: null;
}

type AppActions = ActionType<typeof actions>;

type ModuleState = GameState;
type ModuleActions = AppActions;

export { ModuleState, ModuleActions };
