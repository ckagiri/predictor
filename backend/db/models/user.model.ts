import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { Entity, schema } from './base.model';

export interface User extends Entity {
  username?: string;
  password?: string;
  isAdmin?: boolean;
  comparePassword?: (candidatePassword: string, cb: any) => void;
}

const userSchema = schema({
  username: { type: String, unique: true, lowercase: true },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
}) as Schema<User>;

userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(
      user.password!,
      salt,
      (err, hash) => {
        if (err) {
          return next(err);
        }
        user.password! = hash;
        next();
      },
    );
  });
});

userSchema.methods.comparePassword = function comparePassword(
  candidatePassword: string,
  cb: (err: any, isMatch: any) => void,
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

const UserModel = model<User>('User', userSchema);

export default UserModel;
