import { User } from 'db/models';
import { Jwt, JwtPayload } from 'jsonwebtoken';
import { omit } from 'lodash';

import { TokenGenerator } from './providers/tokenGenerator.js';

export const mapUserToDto = (
  user: JwtPayload & User,
  tokenGen: TokenGenerator
) => {
  const userDto = omit(user, ['createdAt', 'updatedAt', 'password', 'role']);
  userDto.token = tokenGen.generateToken({
    id: user.id!,
    username: user.username!,
  });
  return userDto;
};
