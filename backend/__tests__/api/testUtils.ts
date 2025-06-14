import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import sinon from 'sinon';

import { getUserToken } from '../../app/api/auth/utils';

// passwords must have at least these kinds of characters to be valid, so we'll
// prefex all of the ones we generate with `!0_Oo` to ensure it's valid.
const getPassword = (...args: any) =>
  `!0_Oo${faker.internet.password(...args)}`;
const getUsername = () => faker.string.alpha({ length: 6 });
const getId = () => new mongoose.Types.ObjectId().toHexString();

export interface Req {
  body?: any;
  params?: any;
  query?: any;
}

export interface Res {
  json?: any;
  send?: any;
  status?: any;
}

export const setupReqRes = () => {
  const req: Req = {
    body: {},
    params: {},
    query: {},
  };
  const res: Res = {};

  Object.assign(res, {
    header: sinon.spy(
      function header(this: Res) {
        return this;
      }.bind(res)
    ),
    json: sinon.spy(
      function json(this: Res) {
        return this;
      }.bind(res)
    ),
    send: sinon.spy(
      function send(this: Res) {
        return this;
      }.bind(res)
    ),
    status: sinon.spy(
      function status(this: Res) {
        return this;
      }.bind(res)
    ),
  });
  return { req, res };
};

function buildUser({ password = getPassword(), ...overrides } = {}) {
  return {
    id: getId(),
    password: getSaltedHash(password),
    username: getUsername(),
    ...overrides,
  };
}

function getSaltedHash(password: string) {
  return password;
}

function loginForm(overrides?: any) {
  return {
    password: getPassword(),
    username: getUsername(),
    ...overrides,
  };
}

function token(user: any) {
  return getUserToken(buildUser(user));
}

const handleRequestFailure = ({ response: { data, status } }: any) => {
  const error = new Error(`${status}: ${JSON.stringify(data)}`);
  // remove parts of the stack trace so the error message (codeframe) shows up
  // at the code where the actual problem is.
  if (error.stack) {
    error.stack = error.stack
      .split('\n')
      .filter(
        (line: string) =>
          !line.includes('at handleRequestFailure') &&
          !line.includes('at processTicksAndRejections')
      )
      .join('\n');
  }
  (error as any).status = status;
  (error as any).data = data;
  return Promise.reject(error);
};

export { handleRequestFailure, loginForm, token };
