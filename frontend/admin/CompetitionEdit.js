import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
} from '../admin/materialui'

export const CompetitionEdit = ({ permissions, ...props }) => {

  return (
    <Edit {...props}>
      <SimpleForm
        variant="standard"
        toolbar={null}
        validate={values => {
          const errors = {};
          ['name', 'code', 'slug'].forEach(field => {
            if (!values[field]) {
              errors[field] = 'Required field';
            }
          });
          return errors;
        }}
      >
        <TextInput autoFocus source="name" />
        <TextInput source="slug" fullWidth={true} />
        <TextInput source="code" />
      </SimpleForm>
    </Edit>
  );
};
