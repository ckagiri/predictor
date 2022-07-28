import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import sinon from 'sinon';
import { getUserToken } from '../../app/api/auth/utils';

// passwords must have at least these kinds of characters to be valid, so we'll
// prefex all of the ones we generate with `!0_Oo` to ensure it's valid.
const getPassword = (...args: any) => `!0_Oo${faker.internet.password(...args)}`
const getUsername = () => faker.random.alpha({ count: 6 })
const getId = () => new mongoose.Types.ObjectId().toHexString()

export type Res = {
  status?: any;
  json?: any;
  send?: any;
};

export type Req = {
  params?: any;
  body?: any;
  query?: any;
};

export const setupReqRes = () => {
  const req: Req = {
    params: {},
    body: {},
    query: {},
  };
  const res: Res = {};

  Object.assign(res, {
    header: sinon.spy(
      function header(this: Res) {
        return this;
      }.bind(res),
    ),
    status: sinon.spy(
      function status(this: Res) {
        return this;
      }.bind(res),
    ),
    json: sinon.spy(
      function json(this: Res) {
        return this;
      }.bind(res),
    ),
    send: sinon.spy(
      function send(this: Res) {
        return this;
      }.bind(res),
    ),
  });
  return { req, res };
};

function getSaltedHash(password: string) {
  return password;
}

function buildUser({ password = getPassword(), ...overrides } = {}) {
  return {
    id: getId(),
    username: getUsername(),
    password: getSaltedHash(password),
    ...overrides,
  }
}

function token(user: any) {
  return getUserToken(buildUser(user))
}

function loginForm(overrides?: any) {
  return {
    username: getUsername(),
    password: getPassword(),
    ...overrides,
  }
}

const handleRequestFailure = ({ response: { status, data } }: any) => {
  const error: any = new Error(`${status}: ${JSON.stringify(data)}`)
  // remove parts of the stack trace so the error message (codeframe) shows up
  // at the code where the actual problem is.
  error.stack = error.stack
    .split('\n')
    .filter(
      (line: string) =>
        !line.includes('at handleRequestFailure') &&
        !line.includes('at processTicksAndRejections'),
    )
    .join('\n');
  error.status = status
  error.data = data
  return Promise.reject(error)
}

export {
  token,
  loginForm,
  handleRequestFailure,
}
