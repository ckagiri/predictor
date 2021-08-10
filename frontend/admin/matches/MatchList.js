import React from 'react';
import { generatePath } from 'react-router';
import { useParams, useRouteMatch } from 'react-router-dom';

import { ReferenceListBase, useListContext } from 'lib/core/controller';

const MatchList = props => {
  const { path } = props;
  const { competition, season, round } = useParams();
  const resourcePath = generatePath(path, { competition, season, round });
  const { url: basePath } = useRouteMatch();

  const options = {
    basePath,
    resourcePath,
    referencingResource: round ? 'gamerounds' : 'seasons',
    id: `${competition}_${season}${round ? `_${round}` : ''}`,
  };
  return (
    <ReferenceListBase {...props} {...options}>
      <MatchListView />
    </ReferenceListBase>
  );
};

const MatchListView = () => {
  const { data, ids, loaded } = useListContext();

  if (!loaded) {
    return <React.Fragment>Loading...</React.Fragment>;
  }

  const records = ids.map(id => data[id]);

  return (
    <ul>
      {records.map(({ id, homeTeam, awayTeam }) => (
        <li key={id}>
          {homeTeam.name} vs {awayTeam.name}
        </li>
      ))}
    </ul>
  );
};

export default MatchList;
