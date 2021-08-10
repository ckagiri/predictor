import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Link, useRouteMatch } from 'react-router-dom';
import { ListBase, useListContext } from 'lib/core/controller';

const CompetitionList = props => {
  const { path: resourcePath } = props;
  const { url: basePath } = useRouteMatch();

  return (
    <ListBase basePath={basePath} resourcePath={resourcePath} {...props}>
      <CompetitionListView />
    </ListBase>
  );
};

const useStyles = makeStyles({
  link: {
    display: 'inline-flex',
    alignItems: 'center',
  },
});

const SeasonsLink = ({ basePath, record }) => {
  const classes = useStyles();
  return record ? (
    <Button
      size="small"
      color="primary"
      component={Link}
      to={{
        pathname: `${basePath}/${record.slug}/seasons`,
      }}
      className={classes.link}
    >
      Seasons
    </Button>
  ) : null;
};

const CompetitionListView = () => {
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
          <SeasonsLink basePath={basePath} record={record} />
        </li>
      ))}
    </ul>
  );
};

export default CompetitionList;
