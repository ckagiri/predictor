import { ModuleState, ModuleActions } from './types';
import ActionTypes from './constants';

export const initialState: ModuleState = {
  primed: false,
  priming: false,
  competitions: {},
  selectedCompetition: null,
  seasons: {},
  selectedSeason: null,
  matches: {},
  predictions: {},
  teams: {},
  gameRounds: {},
  selectedGameRound: null
};

function gameReducer(state: ModuleState = initialState, action: ModuleActions): ModuleState {
  switch (action.type) {
    case ActionTypes.PRIME_START: {
      return {
        ...state,
        priming: true
      };
    }
    case ActionTypes.GET_COMPETITIONS_COMPLETE: {
      const competitions = action.payload;
      const entities = competitions.reduce(
        (acc, competition) => {
          return {
            ...acc,
            [competition.slug]: competition
          };
        },
        { ...state.competitions }
      );
      return { ...state, competitions: entities };
    }
    case ActionTypes.SELECT_COMPETITION: {
      const competitionSlug = action.payload;
      return { ...state, selectedCompetition: competitionSlug };
    }
    case ActionTypes.GET_SEASONS_COMPLETE: {
      const { competitionSlug, seasons } = action.payload;
      return {
        ...state,
        seasons: {
          ...state.seasons,
          [competitionSlug]: seasons
        }
      };
    }
    case ActionTypes.SELECT_SEASON: {
      const seasonId = action.payload;
      return { ...state, selectedSeason: seasonId };
    }
    case ActionTypes.SET_SEASON_DATA: {
      const { seasonId, matches, teams, predictions, rounds } = action.payload;
      return {
        ...state,
        teams: {
          ...state.teams,
          [seasonId]: teams
        },
        matches: {
          ...state.matches,
          [seasonId]: matches
        },
        predictions: {
          ...state.predictions,
          [seasonId]: predictions
        },
        gameRounds: {
          ...state.gameRounds,
          [seasonId]: rounds
        }
      };
    }
    case ActionTypes.SELECT_GAME_ROUND: {
      const gameRound = action.payload;
      return {
        ...state,
        selectedGameRound: gameRound
      };
    }
    case ActionTypes.PRIME_ERROR: {
      return {
        ...state,
        priming: false
      };
    }
    case ActionTypes.PRIME_COMPLETE: {
      return {
        ...state,
        priming: false,
        primed: true
      };
    }
    default: {
      return state;
    }
  }
}

export default gameReducer;
