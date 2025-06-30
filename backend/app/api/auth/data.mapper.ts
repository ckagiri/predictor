import { User } from 'db/models';
import { omit } from 'lodash';

import { TokenGenerator } from './providers/tokenGenerator.js';

export const mapUserToDto = (
  user: User,
  tokenGen: TokenGenerator
): Partial<User> => {
  const userDto = omit(user, ['createdAt', 'updatedAt', 'password', 'role']);
  userDto.token = tokenGen.generateToken({
    id: user.id!,
    username: user.username!,
  });
  return userDto;
};
