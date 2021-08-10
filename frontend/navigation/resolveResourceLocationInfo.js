import { matchPath } from 'react-router';
const adminResources = [
  {
    resource: 'competitions',
    path: 'competitions',
    routePath: '/competitions',
  },
  {
    resource: 'competitions',
    path: 'competitions.edit',
    routePath: '/competitions/:competition',
  },
  {
    resource: 'seasons',
    path: 'competitions.edit.seasons',
    routePath: '/competitions/:competition/seasons',
  },
  {
    resource: 'seasons',
    path: 'competitions.edit.seasons.edit',
    routePath: '/competitions/:competition/seasons/:season',
  },
  {
    resource: 'matches',
    path: 'competitions.edit.seasons.edit.matches',
    routePath: '/competitions/:competition/seasons/:season/matches',
  },
  {
    resource: 'matches',
    path: 'competitions.edit.seasons.edit.matches.edit',
    routePath: '/competitions/:competition/seasons/:season/matches/:match',
  },
  {
    resource: 'gamerounds',
    path: 'competitions.edit.seasons.edit.gamerounds',
    routePath: '/competitions/:competition/seasons/:season/gamerounds',
  },
  {
    resource: 'gamerounds',
    path: 'competitions.edit.seasons.edit.gamerounds.edit',
    routePath: '/competitions/:competition/seasons/:season/gamerounds/:round',
  },
  {
    resource: 'matches',
    path: 'competitions.edit.seasons.edit.gamerounds.edit.matches',
    routePath:
      '/competitions/:competition/seasons/:season/gamerounds/:round/matches',
  },
];

export const resolveResourceLocationInfo = pathname => {
  for (const resource of adminResources) {
    const { routePath } = resource;
    const match = matchPath(pathname, {
      path: `/admin${routePath}`,
      exact: true,
    });

    if (match && match.isExact) {
      return { params: match.params, ...resource };
    }
  }
  return null;
};
