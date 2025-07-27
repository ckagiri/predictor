import { expressjwt } from 'express-jwt';

const secret = process.env.API_SECRET ?? 'secret';
export default ({ ...overrides } = {}) =>
  expressjwt({ algorithms: ['HS256'], secret, ...overrides });
