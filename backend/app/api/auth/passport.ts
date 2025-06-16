import { HydratedDocument } from 'mongoose';
import passportLocal from 'passport-local';

import UserModel, { User } from '../../../db/models/user.model.js';

const LocalStrategy = passportLocal.Strategy;

/**
 * Sign in using Email and Password.
 */
function getLocalStrategy() {
  return new LocalStrategy(
    { usernameField: 'username' },
    (username, password, done) => {
      UserModel.findOne(
        { username: username.toLowerCase() },
        (err: Error | undefined, user: HydratedDocument<User> | undefined) => {
          if (err) {
            done(err);
            return;
          }
          if (!user) {
            done(undefined, false, { message: 'username not found' });
            return;
          }
          user.comparePassword!(
            password,
            (err: Error | undefined, isMatch: boolean) => {
              if (err) {
                done(err);
                return;
              }
              if (isMatch) {
                done(undefined, user.toObject());
                return;
              }
              done(undefined, false, {
                message: 'username or password is invalid',
              });
            }
          );
        }
      );
    }
  );
}

export { getLocalStrategy };
