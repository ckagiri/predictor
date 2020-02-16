import { createSelector } from 'reselect';
import { ModuleState } from './types';

export const selectedCompetitionSelector = createSelector(
  (state: ModuleState) => state.selectedCompetition,
  (state: ModuleState) => state.competitions,
  (competitionSlug, competitionMap) => competitionMap[competitionSlug!] || {}
);

export const selectedSeasonSelector = createSelector(
  (state: ModuleState) => state.selectedCompetition,
  (state: ModuleState) => state.selectedSeason,
  (state: ModuleState) => state.seasons,
  (competitionSlug, seasonId, competitionSeasonsMap) => {
    const seasons = competitionSeasonsMap[competitionSlug!];
    const season = seasons.filter(n => n.id === seasonId)[0];
    return season;
  }
);

export const selectedRoundSelector = (state: ModuleState) => state.selectedGameRound;
export const seasonFixturesSelector = (state: ModuleState) => {
  const seasonId = selectedSeasonSelector(state).id;
  const seasonFixturesMap = state.matches;
  const matches = seasonFixturesMap[seasonId];
  return matches;
};

export const roundFixturesSelector = createSelector(
  [seasonFixturesSelector, selectedRoundSelector],
  (matches, round) => {
    return matches.filter(m => m.gameRound == round);
  }
);
