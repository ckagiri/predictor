import React from 'react';
import { ListBase, RecordContextProvider, useListContext } from '../../frame';
import { ShowButton } from '../../ui-materialui';

const MatchList = () => {
  return (
    <ListBase>
      <MatchListView />
    </ListBase>
  );
};

const MatchListView = () => {
  const { data, isLoading } = useListContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {data?.map(record => (
        <RecordContextProvider key={record.id} value={record}>
          <li key={record.id}>
            {record.homeTeam.name} vs {record.awayTeam.name}
            <ShowButton />
          </li>
        </RecordContextProvider>
      ))}
    </ul>
  );
};

export default MatchList;
