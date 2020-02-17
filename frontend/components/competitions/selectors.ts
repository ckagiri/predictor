import { createSelector } from 'reselect';
import { ModuleState } from './types';

export const selectedCompetitionSelector = createSelector(
  (state: ModuleState) => state.selectedCompetition,
  (state: ModuleState) => state.competitions,
  (competitionSlug, competitionMap) => competitionMap[competitionSlug!] || {},
);

export const selectedSeasonIdSelector = (state: ModuleState) =>
  state.selectedSeason;
export const selectedSeasonSelector = createSelector(
  (state: ModuleState) => state.selectedCompetition,
  (state: ModuleState) => state.selectedSeason,
  (state: ModuleState) => state.seasons,
  (competitionSlug, seasonId, competitionSeasonsMap) => {
    const seasons =
      (competitionSlug && competitionSeasonsMap[competitionSlug]) || [];
    const season = seasons.filter(n => n.id === seasonId)[0];
    return season;
  },
);

export const seasonMatchesSelector = createSelector(
  (state: ModuleState) => state.selectedSeason,
  (state: ModuleState) => state.matches,
  (seasonId, seasonMatchesMap) => {
    const matches = (seasonId && seasonMatchesMap[seasonId]) || [];
    return matches;
  },
);

export const selectedRoundIdSelector = (state: ModuleState) =>
  state.selectedGameRound;
export const roundMatchesSelector = createSelector(
  [seasonMatchesSelector, selectedRoundIdSelector],
  (matches, round) => {
    return matches.filter(m => m.gameRound == round);
  },
);
