import passport from 'passport'
import { Request, Response, NextFunction } from 'express';
import User, { User as IUser } from '../../../db/models/user.model';
import { getUserToken, isPasswordAllowed, userToJSON } from './utils';

const authUserToJSON = (user: IUser) => ({
  ...userToJSON(user),
  token: getUserToken(user),
})

export async function register(req: Request, res: Response) {
  const { email, username, password } = req.body
  if (!username) {
    return res.status(400).json({ message: `username can't be blank` })
  }
  if (!password) {
    return res.status(400).json({ message: `password can't be blank` })
  }
  if (!isPasswordAllowed(password)) {
    return res.status(400).json({ message: `password is not strong enough` })
  }
  // Todo: twitter like username & validation
  // Todo: email validation
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).send({ message: 'Username is already taken' });
  }
  const user = new User({ email, username, password });
  // ...getSaltAndHash(password),
  const newUser = await user.save();
  return res.json({ user: authUserToJSON(newUser) })
}

export async function login(req: Request, res: Response, next: NextFunction) {
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
    return res.json({ user: authUserToJSON(req['user'] as IUser) })
  } else {
    return res.status(404).send()
  }
}
