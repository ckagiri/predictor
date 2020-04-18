import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
} from '../admin/materialui'

export const SeasonCreate = ({ permissions, ...props }) => {

  return (
    <Create {...props}>
      <SimpleForm
        toolbar={null}
        validate={values => {
          const errors = {};
          ['name', 'year', 'slug'].forEach(field => {
            if (!values[field]) {
              errors[field] = 'Required field';
            }
          });
          return errors;
        }}
      >
        <TextInput autoFocus source="name" />
        <TextInput source="slug" />
        <TextInput source="year" />
      </SimpleForm>
    </Create>
  );
};
