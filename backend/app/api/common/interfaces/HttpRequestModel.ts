import { IncomingHttpHeaders } from 'http';

export default interface HttpRequestModel {
  body: any;
  headers: IncomingHttpHeaders;
  params: ParamsDictionary;
  query: ParsedQs;
  user?: any; // Optional user object, can be used for authenticated requests
}

type ParamsDictionary = Record<string, string>;

interface ParsedQs {
  [key: string]: undefined | string | ParsedQs | (string | ParsedQs)[];
}
