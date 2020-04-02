import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form as FinalForm } from 'react-final-form';
import { useLogin, useSafeSetState } from '../../core';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons/faCircleNotch';

const Input = ({
  meta: { touched, error } = { touched: false, error: '' }, // eslint-disable-line react/prop-types
  input: { ...inputProps }, // eslint-disable-line react/prop-types
  ...props
}) => (
  <Form.Group color={touched && error ? 'danger' : ''}>
    <Form.Label>{props.label}</Form.Label>
    <Form.Control {...inputProps} {...props} />
    {!!(touched && error) && (
      <Form.Control.Feedback>{touched && error}</Form.Control.Feedback>
    )}
  </Form.Group>
);

const LoginForm = ({ redirectTo }) => {
  const [loading, setLoading] = useSafeSetState(false);
  const login = useLogin();

  const validate = values => {
    const errors = { username: undefined, password: undefined };

    if (!values.username) {
      errors.username = 'validation required';
    }
    if (!values.password) {
      errors.password = 'validation required';
    }
    return errors;
  };

  const submit = values => {
    setLoading(true);
    login(values, redirectTo)
      .then(() => {
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        // Todo: notify
      });
  };

  return (
    <FinalForm
      onSubmit={submit}
      validate={validate}
      render={({ handleSubmit }) => (
        <Form onSubmit={handleSubmit} noValidate>
          <div className="px-3 pb-3">
            <div className="mt-3">
              <Field
                autoFocus
                id="username"
                name="username"
                component={Input}
                label="Username"
                disabled={loading}
              />
            </div>
            <div className="mt-3">
              <Field
                id="password"
                name="password"
                component={Input}
                label="Password"
                type="password"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>
          <div className="py-2 px-3">
            <Button
              variant="contained"
              type="submit"
              color="primary"
              disabled={loading}
              className="w-100"
            >
              {loading && (
                <FontAwesomeIcon
                  className="m-3"
                  size="2x"
                  spin
                  icon={faCircleNotch}
                />
              )}
              {'Sign_in'}
            </Button>
          </div>
        </Form>
      )}
    />
  );
};

LoginForm.propTypes = {
  redirectTo: PropTypes.string,
};

export default LoginForm;
