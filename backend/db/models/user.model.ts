import * as bcrypt from 'bcryptjs';
import { model, Schema } from 'mongoose';

import { Entity, schema } from './base.model.js';

export interface User extends Entity {
  comparePassword?: (candidatePassword: string, cb: any) => void;
  password?: string;
  role?: string;
  username?: string;
}

const roles = ['user', 'admin'];

const userSchema = schema({
  password: { type: String },
  role: {
    default: 'user',
    enum: roles,
    type: String,
  },
  username: { lowercase: true, required: true, type: String, unique: true },
}) as Schema<User>;

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  bcrypt.genSalt(process.env.NODE_ENV !== 'test' ? 10 : 1, (err, salt) => {
    if (err) {
      next(err);
      return;
    }
    if (typeof salt !== 'string') {
      next(new Error('Failed to generate salt'));
      return;
    }
    bcrypt.hash(this.password!, salt, (err, hash) => {
      if (err) {
        next(err);
        return;
      }
      this.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function comparePassword(
  candidatePassword: string,
  cb: (err: any, isMatch: unknown) => void
) {
  bcrypt.compare(candidatePassword, this.password ?? '', (err, isMatch) => {
    cb(err, isMatch);
  });
};

const UserModel = model<User>('User', userSchema);

export default UserModel;
