import { ResourceItem, useBasename, useCreatePath } from '../../../frame';
import { BreadcrumbPath } from '../../../ui-materialui';

export type BreadcrumbPathMap = Record<string, BreadcrumbPath>;
export type ResourceBreadcrumbPathMap = Record<string, BreadcrumbPathMap>;

export const useResourceBreadcrumbPaths = (
  resource: ResourceItem
): BreadcrumbPathMap => {
  const createPath = useCreatePath();
  const basename = useBasename();
  const resourceName = resource.name ?? '';

  const competitionsKey = 'competitions';
  const competitionsPath = {
    [competitionsKey]: {
      label: 'Competitions',
      to: `${basename}/competitions`,
    },
    [`${competitionsKey}.create`]: {
      label: 'Create',
      to: createPath({
        resource: 'competitions',
        type: 'create',
      }),
    },
    [`${competitionsKey}.edit`]: {
      label: (pathContext: any) => {
        const competition = pathContext['competitions'];
        return !competition ? 'Show' : competition.name;
      },
      to: (pathContext: any) => {
        const competition = pathContext['competitions'];
        return competition
          ? createPath({
              resource: 'competitions',
              id: competition.slug,
              type: 'show',
            })
          : '';
      },
    },
    [`${competitionsKey}.show`]: {
      label: (pathContext: any) => {
        const competition = pathContext['competitions'];
        return !competition ? 'Show' : competition.name;
      },
    },
  };

  const seasonsKey = 'competitions.edit.seasons';
  const seasonsPath = {
    [seasonsKey]: {
      label: 'Seasons',
      to: (pathContext: any) => {
        const competition = pathContext['competitions'];
        return competition
          ? `${basename}/competitions/${competition.slug}/seasons`
          : '';
      },
    },
    [`${seasonsKey}.create`]: {
      label: 'Create',
      to: (pathContext: any) => {
        const competition = pathContext['competitions'];
        return competition
          ? createPath({
              resource: `competitions/${competition.slug}/seasons`,
              type: 'create',
            })
          : '';
      },
    },
    [`${seasonsKey}.edit`]: {
      label: (pathContext: any) => {
        const season = pathContext['seasons'];
        return !season ? 'Show' : season.name;
      },
      to: (pathContext: any) => {
        const competition = pathContext['competitions'];
        const season = pathContext['seasons'];
        return competition && season
          ? createPath({
              resource: `competitions/${competition.slug}/seasons`,
              id: season.slug,
              type: 'show',
            })
          : '';
      },
    },
    [`${seasonsKey}.show`]: {
      label: (pathContext: any) => {
        const season = pathContext['seasons'];
        return !season ? 'Show' : season.name;
      },
    },
  };

  const roundsKey = 'competitions.edit.seasons.edit.rounds';
  const roundsPath = {
    [roundsKey]: {
      label: 'Rounds',
      to: (pathContext: any) => {
        const competition = pathContext['competitions'];
        const season = pathContext['seasons'];
        return competition && season
          ? `${basename}/competitions/${competition.slug}/seasons/${season.slug}/rounds`
          : '';
      },
    },
    [`${roundsKey}.create`]: {
      label: 'Create',
      to: (pathContext: any) => {
        const competition = pathContext['competitions'];
        const season = pathContext['seasons'];
        return competition && season
          ? createPath({
              resource: `competitions/${competition.slug}/seasons/${season.slug}/rounds`,
              type: 'create',
            })
          : '';
      },
    },
    [`${roundsKey}.edit`]: {
      label: (pathContext: any) => {
        const round = pathContext['rounds'];
        return !round ? 'Show' : round.name;
      },
      to: (pathContext: any) => {
        const competition = pathContext['competitions'];
        const season = pathContext['seasons'];
        const round = pathContext['rounds'];
        return competition && season && round
          ? createPath({
              resource: `competitions/${competition.slug}/seasons/${season.slug}/rounds`,
              id: round.slug,
              type: 'show',
            })
          : '';
      },
    },
    [`${roundsKey}.show`]: {
      label: (pathContext: any) => {
        const round = pathContext['rounds'];
        return !round ? 'Show' : round.name;
      },
    },
  };

  const matchesKey = 'competitions.edit.seasons.edit.rounds.edit.matches';
  const matchesPath = {
    [matchesKey]: {
      label: 'Matches',
      to: (pathContext: any) => {
        const competition = pathContext['competitions'];
        const season = pathContext['seasons'];
        const round = pathContext['rounds'];
        return competition && season && round
          ? `${basename}/competitions/${competition.slug}/seasons/${season.slug}/rounds/${round.slug}/matches`
          : '';
      },
    },
    [`${matchesKey}.create`]: {
      label: 'Create',
      to: (pathContext: any) => {
        const competition = pathContext['competitions'];
        const season = pathContext['seasons'];
        const round = pathContext['rounds'];
        return competition && season && round
          ? createPath({
              resource: `competitions/${competition.slug}/seasons/${season.slug}/rounds/${round.slug}/matches`,
              type: 'create',
            })
          : '';
      },
    },
    [`${matchesKey}.edit`]: {
      label: (pathContext: any) => {
        const match = pathContext['matches'];
        return !match ? 'Show' : match.slug;
      },
      to: (pathContext: any) => {
        const competition = pathContext['competitions'];
        const season = pathContext['seasons'];
        const round = pathContext['rounds'];
        const match = pathContext['matches'];
        return competition && season && round && match
          ? createPath({
              resource: `competitions/${competition.slug}/seasons/${season.slug}/rounds/${round.slug}/matches`,
              id: match.slug,
              type: 'show',
            })
          : '';
      },
    },
    [`${matchesKey}.show`]: {
      label: (pathContext: any) => {
        const match = pathContext['matches'];
        return !match ? 'Show' : match.slug;
      },
    },
  };

  const resourcePaths: ResourceBreadcrumbPathMap = {
    competitions: competitionsPath,
    seasons: seasonsPath,
    rounds: roundsPath,
    matches: matchesPath,
  };

  return resourcePaths[resourceName] ?? {};
};
