import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcrypt-nodejs';

import { Entity, DocumentEntity, schema } from './base.model';

export interface User extends Entity {
  id?: string;
  email: string;
  isAdmin?: boolean;
  phone?: string;
  username?: string;
  displayName?: string;
  imageUrl?: string;
  comparePassword?: any;
  local?: {
    password: string;
  };
}

export interface UserDocument extends User, DocumentEntity {
  comparePassword(candidatePassword: string, cb: any): void;
}

const userSchema = schema({
  email: { type: String, required: false, lowercase: true },
  local: {
    password: { type: Schema.Types.String },
    required: false,
  },
  username: { type: String, unique: true, lowercase: true },
  displayName: { type: String },
  isAdmin: { type: Boolean, default: false },
  phone: { type: String },
  imageUrl: { type: String },
});

userSchema.pre('save', function (next) {
  const user = this as UserDocument;
  if (!user.isModified('local.password')) {
    return next();
  }
  bcrypt.genSalt(10, (error, salt) => {
    if (error) {
      return next(error);
    }
    bcrypt.hash(
      user.local!.password,
      salt,
      () => undefined,
      (err: any, hash: any) => {
        if (err) {
          return next(err);
        }
        user.local!.password = hash;
        next();
      },
    );
  });
});

userSchema.methods.comparePassword = function comparePassword(
  candidatePassword: string,
  cb: any,
) {
  bcrypt.compare(candidatePassword, this.local.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    } else {
      return cb(null, isMatch);
    }
  });
};

const UserModel = model<UserDocument>('User', userSchema);

export default UserModel;
