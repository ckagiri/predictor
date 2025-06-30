import jwt from 'jsonwebtoken';

export interface TokenGenerator {
  generateToken({ id, username }: UserData): string;
}
interface UserData {
  id: string;
  username: string;
}

const secret = process.env.API_SECRET ?? 'secret';
// seconds/minute * minutes/hour * hours/day * 60 days
const sixtyDaysInSeconds = 60 * 60 * 24 * 60;
// to keep our tests reliable, we'll use the requireTime if we're not in production
// and we'll use Date.now() if we are.
const requireTime = Date.now();
const now = () =>
  process.env.NODE_ENV === 'production' ? Date.now() : requireTime;

export interface TokenGenerator {
  generateToken({ id, username }: UserData): string;
}

export class TokenGeneratorImpl implements TokenGenerator {
  static getInstance(): TokenGenerator {
    return new TokenGeneratorImpl();
  }

  generateToken({ id, username }: UserData): string {
    const issuedAt = Math.floor(now() / 1000);
    return jwt.sign(
      {
        exp: issuedAt + sixtyDaysInSeconds,
        iat: issuedAt,
        id,
        username,
      },
      secret
    );
  }
}
