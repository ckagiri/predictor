import {
  PRIME_START,
  PRIME_ERROR,
  PRIME_COMPLETE,
  GET_COMPETITIONS_COMPLETE,
  SELECT_COMPETITION,
  GET_SEASONS_COMPLETE,
  SELECT_SEASON,
  SET_SEASON_DATA,
  SELECT_GAME_ROUND,
} from './constants';

export const initialState = {
  primed: false,
  priming: false,
  competitions: {},
  selectedCompetition: null,
  seasons: {},
  selectedSeason: null,
  matches: {},
  predictions: {},
  teams: {},
  selectedGameRound: null,
};

function gameReducer(state = initialState, action) {
  switch (action.type) {
    case PRIME_START: {
      return {
        ...state,
        priming: true,
      };
    }
    case GET_COMPETITIONS_COMPLETE: {
      const competitions = action.payload;
      const entities = competitions.reduce(
        (acc, competition) => ({
          ...acc,
          [competition.slug]: competition,
        }),
        { ...state.competitions },
      );
      return { ...state, competitions: entities };
    }
    case SELECT_COMPETITION: {
      const competitionSlug = action.payload;
      return { ...state, selectedCompetition: competitionSlug };
    }
    case GET_SEASONS_COMPLETE: {
      const { competitionSlug, seasons } = action.payload;
      return {
        ...state,
        seasons: {
          ...state.seasons,
          [competitionSlug]: seasons,
        },
      };
    }
    case SELECT_SEASON: {
      const seasonId = action.payload;
      return { ...state, selectedSeason: seasonId };
    }
    case SET_SEASON_DATA: {
      const { seasonId, matches, teams, predictions } = action.payload;
      return {
        ...state,
        teams: {
          ...state.teams,
          [seasonId]: teams,
        },
        matches: {
          ...state.matches,
          [seasonId]: matches,
        },
        predictions: {
          ...state.predictions,
          [seasonId]: predictions,
        },
      };
    }
    case SELECT_GAME_ROUND: {
      const gameRound = action.payload;
      return {
        ...state,
        selectedGameRound: gameRound,
      };
    }
    case PRIME_ERROR: {
      return {
        ...state,
        priming: false,
      };
    }
    case PRIME_COMPLETE: {
      return {
        ...state,
        priming: false,
        primed: true,
      };
    }
    default: {
      return state;
    }
  }
}

export default gameReducer;
