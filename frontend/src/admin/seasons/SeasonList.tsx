import React from 'react';
import { ListBase, RecordContext, useCreatePath, useListContext } from '../../frame';
import { Link } from 'react-router-dom';
import { ShowButton } from '../../ui-materialui';

export const SeasonList = () => {
  return (
    <ListBase>
      <SeasonListView />
    </ListBase>
  );
};


const SeasonListView = () => {
  const { data, isLoading, resource } = useListContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const seasonPath = (seasonSlug: string) => (
    `${resource.path}/${seasonSlug}`
  );

  return (
    <ul>
      {data?.map(record => (
        <RecordContext.Provider key={record.id} value={record}>
          <li key={record.id}>
            {record.name}&nbsp;
            <ShowButton />
            <RoundsLink seasonPath={seasonPath(record.slug)} />&nbsp;
            <TeamsLink seasonPath={seasonPath(record.slug)} />&nbsp;
          </li>
        </RecordContext.Provider>
      ))}
    </ul>
  );
};

type RoundsLinkProps = {
  seasonPath: string;
}
type TeamsLinkProps = RoundsLinkProps;

const RoundsLink = ({ seasonPath }: RoundsLinkProps) => {
  const createPath = useCreatePath();
  return (
    <Link
      to={createPath({ type: 'list', resource: `${seasonPath}/rounds` })}
    >
      Rounds
    </Link>
  )
};

const TeamsLink = ({ seasonPath }: TeamsLinkProps) => {
  const createPath = useCreatePath();
  return (
    <Link
      to={createPath({ type: 'list', resource: `${seasonPath}/teams}` })}
    >
      Teams
    </Link>
  )
};

export default SeasonList;
