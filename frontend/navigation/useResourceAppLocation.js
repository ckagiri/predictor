import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import find from 'lodash/find';
import zipObjectDeep from 'lodash/zipObjectDeep';
import get from 'lodash/get';
import keys from 'lodash/keys';
import values from 'lodash/values';

import { resolveResourceLocationInfo } from './resolveResourceLocationInfo';

const recordSelector = (name, params) => state => {
  const {
    competition: competitionSlug,
    season: seasonSlug,
    round: gameroundPos,
  } = params;
  const getRecord = (name, criteria) => {
    const matcher = zipObjectDeep(keys(criteria), values(criteria));
    return find(Object.values(state.resources[name].data || []), matcher);
  };
  const getCompetition = slug => getRecord('competitions', { slug });
  const getSeason = (competionId, slug) =>
    getRecord('seasons', { 'competition.id': competionId, slug });
  const getRound = (seasonId, position) =>
    getRecord('gamerounds', { season: seasonId, position });

  let competition, season, gameround;
  if (competitionSlug) {
    competition = getCompetition(competitionSlug);
  }
  if (competitionSlug && seasonSlug) {
    season = getSeason(get(competition, 'id'), seasonSlug);
  }
  if (competitionSlug && seasonSlug && gameroundPos) {
    gameround = getRound(get(season, 'id'), parseInt(gameroundPos, 10));
  }
  return { competition, season, gameround };
};

export const useResourceAppLocation = () => {
  const { pathname } = useLocation();

  // Since this can be null at mount, don't memoize it
  const resourceLocationInfo = resolveResourceLocationInfo(pathname);

  if (resourceLocationInfo == null) {
    return null;
  }

  const record = useSelector(
    resourceLocationInfo.path.split('.').includes('edit')
      ? recordSelector(
          resourceLocationInfo.resource,
          resourceLocationInfo.params,
        )
      : () => undefined,
  );

  return {
    path: resourceLocationInfo.path,
    values: { record },
  };
};
