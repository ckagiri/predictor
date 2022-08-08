import { HydratedDocument } from 'mongoose';
import passportLocal from "passport-local";
import UserModel, { User } from "../../../db/models/user.model";

const LocalStrategy = passportLocal.Strategy;

/**
 * Sign in using Email and Password.
 */
function getLocalStrategy() {
  return new LocalStrategy({ usernameField: "username" }, (username, password, done) => {
    UserModel.findOne({ username: username.toLowerCase() }, (err: Error, user: HydratedDocument<User>) => {
      if (err) { return done(err); }
      if (!user) {
        return done(undefined, false, { message: 'username not found' });
      }
      user.comparePassword!(password, (err: Error, isMatch: boolean) => {
        if (err) { return done(err); }
        if (isMatch) {
          return done(undefined, user.toObject());
        }
        return done(undefined, false, { message: 'username or password is invalid' });
      });
    });
  });
}

export {
  getLocalStrategy,
}
