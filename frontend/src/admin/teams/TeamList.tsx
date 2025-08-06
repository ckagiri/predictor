import React from 'react';
import { ListBase, useListContext } from '../../frame';

const TeamList = () => {
  return (
    <ListBase>
      <TeamListView />
    </ListBase>
  );
};

const TeamListView = () => {
  const { data, isLoading } = useListContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {data?.map(({ id, name }) => (
        <li key={id}>{name}</li>
      ))}
    </ul>
  );
};

export default TeamList;
