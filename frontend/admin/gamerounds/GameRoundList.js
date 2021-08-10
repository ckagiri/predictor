import React from 'react';
import { generatePath } from 'react-router';
import { Link, useParams, useRouteMatch } from 'react-router-dom';
import Button from '@material-ui/core/Button';

import { ReferenceListBase, useListContext } from 'lib/core/controller';

const GameRoundList = props => {
  const { path } = props;
  const { competition, season } = useParams();
  const resourcePath = generatePath(path, { competition, season });
  const { url: basePath } = useRouteMatch();

  const options = {
    basePath,
    resourcePath,
    referencingResource: 'seasons',
    id: `${competition}_${season}`,
  };
  return (
    <ReferenceListBase {...props} {...options}>
      <GameRoundListView />
    </ReferenceListBase>
  );
};

const MatchesLink = ({ basePath, record }) => {
  return record ? (
    <Button
      size="small"
      color="primary"
      component={Link}
      to={{
        pathname: `${basePath}/${record.position}/matches`,
      }}
    >
      Matches
    </Button>
  ) : null;
};

const GameRoundListView = () => {
  const { data, ids, loaded, basePath } = useListContext();

  if (!loaded) {
    return <React.Fragment>Loading...</React.Fragment>;
  }

  const records = ids.map(id => data[id]);

  return (
    <ul>
      {records.map(record => (
        <li key={record.id}>
          {record.name}
          <MatchesLink basePath={basePath} record={record} />
        </li>
      ))}
    </ul>
  );
};

export default GameRoundList;
