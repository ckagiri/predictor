export const getResourcesBreadcrumbPaths = () => {
  const resourcePaths = {
    competitions: {
      label: 'Competitions',
      to: '/admin/competitions',
    },
    'competitions.edit': {
      label: ({ record }) => {
        const { competition } = record;
        return !competition ? '...' : `${competition.name}`;
      },
      to: ({ record }) => {
        const { competition } = record;
        return competition && `/admin/competitions/${competition.slug}`;
      },
    },
    'competitions.edit.seasons': {
      label: 'Seasons',
      to: ({ record }) => {
        const { competition } = record;
        return competition && `/admin/competitions/${competition.slug}/seasons`;
      },
    },
    'competitions.edit.seasons.edit': {
      label: ({ record }) => {
        const { season } = record;
        return !season ? '...' : `${season.name}`;
      },
      to: ({ record }) => {
        const { competition, season } = record;
        return (
          season &&
          `/admin/competitions/${competition.slug}/seasons/${season.slug}`
        );
      },
    },
    'competitions.edit.seasons.edit.matches': {
      label: 'Matches',
      to: ({ record }) => {
        const { competition, season } = record;
        return (
          season &&
          `/admin/competitions/${competition.slug}/seasons/${season.slug}/matches`
        );
      },
    },
    'competitions.edit.seasons.edit.gamerounds': {
      label: 'Gamerounds',
      to: ({ record }) => {
        const { competition, season } = record;
        return (
          season &&
          `/admin/competitions/${competition.slug}/seasons/${season.slug}/gamerounds`
        );
      },
    },
    'competitions.edit.seasons.edit.gamerounds.edit': {
      label: ({ record }) => {
        const { gameround } = record;
        return !gameround ? '...' : `${gameround.position}`;
      },
      to: ({ record }) => {
        const { competition, season, gameround } = record;
        return (
          gameround &&
          `/admin/competitions/${competition.slug}/seasons/${season.slug}/gamerounds/${gameround.position}`
        );
      },
    },
    'competitions.edit.seasons.edit.gamerounds.edit.matches': {
      label: 'Matches',
      to: ({ record }) => {
        const { competition, season, gameround } = record;
        return (
          gameround &&
          `/admin/competitions/${competition.slug}/seasons/${season.slug}/gamerounds/${gameround.position}/matches`
        );
      },
    },
  };
  return resourcePaths;
};
