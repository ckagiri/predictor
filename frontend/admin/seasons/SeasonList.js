import React from 'react';
import { generatePath } from 'react-router';
import { Link, useParams } from 'react-router-dom';
import Button from '@material-ui/core/Button';

import { ReferenceListBase, useListContext } from 'lib/core/controller';

const SeasonList = props => {
  const { path } = props;
  const { competition } = useParams();
  const resourcePath = generatePath(path, { competition });

  const options = {
    resourcePath,
    referencingResource: 'competitions',
    id: competition,
  };
  return (
    <ReferenceListBase {...props} {...options}>
      <SeasonListView />
    </ReferenceListBase>
  );
};

const GameRoundsLink = ({ basePath, record }) => {
  return record ? (
    <Button
      size="small"
      color="primary"
      component={Link}
      to={{
        pathname: `${basePath}/${record.slug}/gamerounds`,
      }}
    >
      GameRounds
    </Button>
  ) : null;
};

const MatchesLink = ({ basePath, record }) => {
  return record ? (
    <Button
      size="small"
      color="primary"
      component={Link}
      to={{
        pathname: `${basePath}/${record.slug}/matches`,
      }}
    >
      Matches
    </Button>
  ) : null;
};

const SeasonListView = () => {
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
          <GameRoundsLink basePath={basePath} record={record} />
          <MatchesLink basePath={basePath} record={record} />
        </li>
      ))}
    </ul>
  );
};

export default SeasonList;
