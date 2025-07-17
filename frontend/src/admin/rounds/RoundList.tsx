import React from 'react';
import { ListBase, RecordContext, useCreatePath, useListContext } from '../../frame';
import { Link } from 'react-router-dom';
import { ShowButton } from '../../ui-materialui';

const RoundList = () => {
  return (
    <ListBase>
      <RoundListView />
    </ListBase>
  );
};

type MatchesLinkProps = {
  roundPath: string;
}
const MatchesLink = ({ roundPath }: MatchesLinkProps) => {
  const createPath = useCreatePath();
  return (
    <Link
      to={createPath({ type: 'list', resource: `${roundPath}/matches` })}
    >
      Matches
    </Link>
  )
}

const RoundListView = () => {
  const { data, isLoading, resource } = useListContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {data?.map(record => (
        <RecordContext.Provider key={record.id} value={record}>
          <li key={record.id}>
            {record.name}&nbsp;
            <ShowButton />
            <MatchesLink roundPath={`${resource.path}/${record.slug}`} />
          </li>
        </RecordContext.Provider>
      ))}
    </ul>
  );
};

export default RoundList;