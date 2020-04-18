import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
} from '../admin/materialui'

export const SeasonEdit = ({ permissions, ...props }) => {

  return (
    <Edit {...props}>
      <SimpleForm
        toolbar={null}
        validate={values => {
          const errors = {};
          ['name', 'code', 'year'].forEach(field => {
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
    </Edit>
  );
};
