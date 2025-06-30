import { IncomingHttpHeaders } from 'http';
import { JwtPayload } from 'jsonwebtoken';

export default interface HttpRequestModel {
  auth?: JwtPayload; // Optional user object, can be used for authenticated requests
  body: any;
  headers: IncomingHttpHeaders;
  params: ParamsDictionary;
  query: ParsedQs;
}

type ParamsDictionary = Record<string, string>;

interface ParsedQs {
  [key: string]: undefined | string | ParsedQs | (string | ParsedQs)[];
}
