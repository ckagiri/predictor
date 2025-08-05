import { model, Schema } from 'mongoose';

import { Entity, schema } from './base.model.js';

export interface User extends Entity {
  password?: string;
  role?: string;
  token?: string;
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

const UserModel = model<User>('User', userSchema);

export default UserModel;
