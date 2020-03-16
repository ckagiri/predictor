import React, { useEffect } from 'React';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import DefaultLoginForm from './LoginForm';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    align-items: center;
    justify-content: flex-start;
`;

const Login = ({ children, ...rest }) => {
  const checkAuth = useCheckAuth();
  const history = useHistory();
  useEffect(() => {
    checkAuth({}, false)
      .then(() => {
        history.push('/')
      })
      .catch(() => {

      });
  }, [checkAuth, history]);

  return (
    <Wrapper {...rest}>
      <Card>
        {children}
      </Card>
    </Wrapper>
  );
}

Login.propTypes = {
  children: PropTypes.node,
};

Login.defaultProps = {
  children: <DefaultLoginForm />,
};
