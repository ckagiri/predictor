import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  ReferenceField,
  RichTextField,
  DateField,
  Datagrid,
  ShowButton,
  List,
} from './materialui';

export const PostShow = props => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="teaser" />
      <RichTextField source="body" />
      <DateField label="Publication date" source="created_at" />
    </SimpleShowLayout>
  </Show>
);

export const PostList = props => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      {/* <ReferenceField label="User" source="userId" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="title" />
      <ShowButton /> */}
    </Datagrid>
  </List>
);
