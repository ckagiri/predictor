import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
} from '../admin/materialui'

export const CompetitionCreate = ({ permissions, ...props }) => {

  return (
    <Create {...props}>
      <SimpleForm
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
        )}
      </SimpleForm>
    </Create>
  );
};
