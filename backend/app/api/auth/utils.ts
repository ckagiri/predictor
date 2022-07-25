import crypto from 'crypto'
import { expressjwt as expressJWT } from 'express-jwt'
import passportLocal from 'passport-local'
import { omit } from "lodash"
import jwt from 'jsonwebtoken'
import User, { User as IUser } from '../../../db/models/user.model';

const LocalStrategy = passportLocal.Strategy;

// Todo set in an environment variable
const secret = 'secret';
// reducing the iterations to 1 in non-production environments to make it faster
const iterations = process.env.NODE_ENV === 'production' ? 1000 : 1
// seconds/minute * minutes/hour * hours/day * 60 days
const sixtyDaysInSeconds = 60 * 60 * 24 * 60
// to keep our tests reliable, we'll use the requireTime if we're not in production
// and we'll use Date.now() if we are.
const requireTime = Date.now()
const now = () =>
  process.env.NODE_ENV === 'production' ? Date.now() : requireTime

function getSaltAndHash(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, 512, 'sha512')
    .toString('hex')
  return { salt, hash }
}

function isPasswordValid(password: string, { salt, hash }: { salt: string, hash: string }) {
  return (
    hash ===
    crypto.pbkdf2Sync(password, salt, iterations, 512, 'sha512').toString('hex')
  )
}

function getUserToken({ id, username }: IUser): string {
  const issuedAt = Math.floor(now() / 1000)
  return jwt.sign(
    {
      id,
      username,
      iat: issuedAt,
      exp: issuedAt + sixtyDaysInSeconds,
    },
    secret,
  )
}

const authMiddleware = expressJWT({ algorithms: ['HS256'], secret })

function getLocalStrategy() {
  return new LocalStrategy(async (username: string, password: string, done: any) => {
    let user: any
    try {
      user = await User.findOne({ username })
    } catch (error) {
      return done(error)
    }
    if (!user || !isPasswordValid(password, { salt: user.salt, hash: user.hash })) {
      return done(null, false, {
        message: 'username or password is invalid',
      })
    }
    return done(null, userToJSON(user))
  })
}

function userToJSON(user: any) {
  return omit(user, ['exp', 'iat', 'hash', 'salt'])
}

function isPasswordAllowed(password: string) {
  return (
    password.length > 6 &&
    // non-alphanumeric
    /\W/.test(password) &&
    // digit
    /\d/.test(password) &&
    // capital letter
    /[A-Z]/.test(password) &&
    // lowercase letter
    /[a-z]/.test(password)
  )
}

export {
  authMiddleware,
  getSaltAndHash,
  userToJSON,
  getLocalStrategy,
  getUserToken,
  isPasswordAllowed,
}
