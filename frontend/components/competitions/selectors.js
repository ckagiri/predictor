import { createSelector } from 'reselect';

export const selectedCompetitionSelector = createSelector(
  state => state.selectedCompetition,
  state => state.competitions,
  (competitionSlug, competitionMap) => competitionMap[competitionSlug] || {},
);

export const selectedSeasonIdSelector = state => state.selectedSeason;
export const selectedSeasonSelector = createSelector(
  state => state.selectedCompetition,
  state => state.selectedSeason,
  state => state.seasons,
  (competitionSlug, seasonId, competitionSeasonsMap) => {
    const seasons =
      (competitionSlug && competitionSeasonsMap[competitionSlug]) || [];
    const season = seasons.filter(n => n.id === seasonId)[0];
    return season;
  },
);

export const seasonMatchesSelector = createSelector(
  state => state.selectedSeason,
  state => state.matches,
  (seasonId, seasonMatchesMap) => {
    const matches = (seasonId && seasonMatchesMap[seasonId]) || [];
    return matches;
  },
);

export const selectedRoundSelector = state => state.selectedGameRound;
export const roundMatchesSelector = createSelector(
  [seasonMatchesSelector, selectedRoundSelector],
  (matches, round) => matches.filter(m => m.gameRound === round),
);
