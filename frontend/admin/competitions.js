import React from 'react';
import {
  TextField,
  Datagrid,
  List,
} from './materialui';

export const CompetitionList = props => (
  <List
    {...props}
    filter={null}
    actions={null}
    bulkActionButtons={false}
    pagination={null}>
    <Datagrid>
      {/* <ReferenceField label="User" source="userId" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="title" />
      <ShowButton /> */}
      <TextField source="name" sortable={false} />
      <TextField source="slug" sortable={false} />
      <TextField source="code" sortable={false} />
    </Datagrid>
  </List>
);
