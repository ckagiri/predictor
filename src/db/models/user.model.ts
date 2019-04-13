import mongoose from "mongoose";
mongoose.set("useCreateIndex", true);
import { Schema, model } from "mongoose";
import * as bcrypt from "bcrypt-nodejs";

import { IEntity, IDocumentEntity } from "./base.model";

export interface IUser extends IEntity {
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
  google?: {
    id: string;
    token: string;
    email: string;
    name: string;
    imageUrl: string;
    profileUrl: string;
  };
  facebook?: {
    id: string;
    token: string;
    email: string;
    name: string;
    imageUrl: string;
    profileUrl: string;
  };
  twitter?: {
    id: string;
    token: string;
    displayName: string;
    username: string;
    imageUrl: string;
  };
}

export interface IUserDocument extends IUser, IDocumentEntity {
  comparePassword(candidatePassword: string, cb: any): void;
}

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  local: {
    password: { type: Schema.Types.String },
    required: false
  },
  username: { type: String, unique: true, lowercase: true },
  displayName: { type: String },
  isAdmin: { type: Boolean, default: false },
  phone: { type: String },
  imageUrl: { type: String },
  google: {
    id: { type: String },
    token: { type: String },
    email: { type: String },
    name: { type: String },
    imageUrl: { type: String },
    profileUrl: { type: String },
    required: false
  },
  facebook: {
    id: { type: String },
    token: { type: String },
    email: { type: String },
    name: { type: String },
    imageUrl: { type: String },
    profileUrl: { type: String },
    required: false
  },
  twitter: {
    id: { type: String },
    token: { type: String },
    displayName: { type: String },
    username: { type: String },
    imageUrl: { type: String },
    required: false
  }
});

userSchema.pre("save", function(next) {
  const user = this as IUserDocument;
  if (!user.isModified("local.password")) {
    return next();
  }
  bcrypt.genSalt(10, (error, salt) => {
    if (error) {
      return next(error);
    }
    bcrypt.hash(user.local!.password, salt, (err: any, hash: any) => {
      if (err) {
        return next(err);
      }
      user.local!.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function comparePassword(
  candidatePassword: string,
  cb: any
) {
  const user = this;
  bcrypt.compare(candidatePassword, user.local.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    } else {
      return cb(null, isMatch);
    }
  });
};

export const User = model<IUserDocument>("User", userSchema);
