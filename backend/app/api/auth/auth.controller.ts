import passport from 'passport'
import { Request, Response, NextFunction } from 'express';
import User, { User as IUser, UserDocument } from '../../../db/models/user.model';
import { getUserToken, isPasswordAllowed, isUsernameAllowed, userToJSON } from './utils';
import { NativeError } from "mongoose";

const authUserToJSON = (user: IUser) => ({
  ...userToJSON(user),
  token: getUserToken(user),
})

async function register(req: Request, res: Response) {
  const { username, password } = req.body
  if (!username) {
    return res.status(400).json({ message: `username can't be blank` })
  }
  if (!password) {
    return res.status(400).json({ message: `password can't be blank` })
  }
  if (!isPasswordAllowed(password)) {
    return res.status(400).json({ message: `password is not strong enough` })
  }
  if (!isUsernameAllowed(username)) {
    return res.status(400).json({ message: `username limited to 4-15 alphanumeric (except underscore) characters` })
  }
  let existingUser: UserDocument | null = null;
  try {
    existingUser = await User.findOne({ username }).exec();
  } catch (error: unknown) {
    res.status(500).send({ message: (<NativeError>error).message });
  }
  if (existingUser) {
    return res.status(409).send({ message: 'Username is already taken' });
  }
  const user = new User({ username, password });
  const newUser = (await user.save()).toObject();
  const authUser = authUserToJSON(newUser)
  return res.json({ user: authUser })
}

async function login(req: Request, res: Response, next: NextFunction) {
  if (!req.body.username) {
    return res.status(400).json({ message: `username can't be blank` })
  }

  if (!req.body.password) {
    return res.status(400).json({ message: `password can't be blank` })
  }

  const { user, info }: any = await authenticate(req, res, next)

  if (user) {
    return res.json({ user: authUserToJSON(user) })
  } else {
    return res.status(400).json(info)
  }
}

function authenticate(req: Request, res: Response, next: NextFunction) {
  return new Promise((resolve, reject) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        reject(err)
      } else {
        resolve({ user, info })
      }
    })(req, res, next)
  })
}

function me(req: Request, res: Response) {
  if (req.user) {
    return res.json({ user: authUserToJSON(req.user) })
  } else {
    return res.status(404).send()
  }
}

export { me, login, register }
