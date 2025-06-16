import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { HydratedDocument } from 'mongoose';
import passport from 'passport';

import UserModel, { User } from '../../../db/models/user.model.js';
import {
  getUserToken,
  isPasswordAllowed,
  isUsernameAllowed,
  userToJSON,
} from './utils.js';

const authUserToJSON = (user: any) => ({
  ...userToJSON(user),
  token: getUserToken(user),
});

function authenticate(req: Request, res: Response, next: NextFunction) {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      'local',
      (err: Error | undefined, user: any, info: any) => {
        if (err) {
          reject(err);
        } else {
          resolve({ info, user });
        }
      }
    )(req, res, next);
  });
}

async function login(req: Request, res: Response, next: NextFunction) {
  if (!req.body.username) {
    return res.status(400).json({ message: `username can't be blank` });
  }

  if (!req.body.password) {
    return res.status(400).json({ message: `password can't be blank` });
  }

  const { info, user }: any = await authenticate(req, res, next);

  if (user) {
    return res.json({ user: authUserToJSON(user) });
  } else {
    return res.status(400).json(info);
  }
}

function me(req: JWTRequest, res: Response) {
  if (req.auth) {
    return res.json({ user: userToJSON(req.auth) });
  } else {
    return res.status(404).send();
  }
}

// todo use a controller and userRepo
async function register(req: Request, res: Response) {
  const { password, username } = req.body;
  if (!username) {
    return res.status(400).json({ message: `username can't be blank` });
  }
  if (!password) {
    return res.status(400).json({ message: `password can't be blank` });
  }
  if (!isPasswordAllowed(password)) {
    return res.status(400).json({ message: `password is not strong enough` });
  }
  if (!isUsernameAllowed(username)) {
    return res.status(400).json({
      message: `username limited to 4-15 alphanumeric (except underscore) characters`,
    });
  }
  let existingUser: HydratedDocument<User> | null = null;
  try {
    existingUser = await UserModel.findOne({ username }).exec();
  } catch (error: unknown) {
    res.status(500).send({ message: (error as Error).message });
  }
  if (existingUser) {
    return res.status(409).send({ message: 'Username is already taken' });
  }
  const user = new UserModel({ password, username });
  const newUser = (await user.save()).toObject();
  const authUser = authUserToJSON(newUser);
  return res.json({ user: authUser });
}

export { login, me, register };
