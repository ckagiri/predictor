import { expressjwt } from 'express-jwt'
import { omit } from "lodash"
import jwt from 'jsonwebtoken'
import { User } from '../../../db/models/user.model';

// Todo set in an environment variable
const secret = 'secret';
// seconds/minute * minutes/hour * hours/day * 60 days
const sixtyDaysInSeconds = 60 * 60 * 24 * 60
// to keep our tests reliable, we'll use the requireTime if we're not in production
// and we'll use Date.now() if we are.
const requireTime = Date.now()
const now = () =>
  process.env.NODE_ENV === 'production' ? Date.now() : requireTime

function getUserToken({ id, username }: User): string {
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

const authMiddleware = expressjwt({ algorithms: ['HS256'], secret })

function userToJSON(user: any) {
  return omit(user, ['createdAt', 'updatedAt', 'isAdmin', 'exp', 'iat', 'hash', 'salt'])
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

function isUsernameAllowed(username: string) {
  // 4-15 alphanumeric characters (with exception of underscore)
  return /^[A-Za-z0-9_]{4,15}$/.test(username)
}

export {
  authMiddleware,
  userToJSON,
  getUserToken,
  isPasswordAllowed,
  isUsernameAllowed,
}
