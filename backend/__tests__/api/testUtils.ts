import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

import { TokenGeneratorImpl } from '../../app/api/auth/providers/tokenGenerator';

// passwords must have at least these kinds of characters to be valid, so we'll
// prefex all of the ones we generate with `!0_Oo` to ensure it's valid.
const getPassword = (...args: any) =>
  `!0_Oo${faker.internet.password(...args)}`;
const getUsername = () => faker.string.alpha({ length: 6 });
const getId = () => new mongoose.Types.ObjectId().toHexString();

const tokenGen = TokenGeneratorImpl.getInstance();

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
  return tokenGen.generateToken(buildUser(user));
}

export { loginForm, token };
