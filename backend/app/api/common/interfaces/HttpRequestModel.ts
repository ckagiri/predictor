import { IncomingHttpHeaders } from 'http';

export default interface HttpRequestModel {
  body: any;
  headers: IncomingHttpHeaders;
  params: ParamsDictionary;
  query: ParsedQs;
}

type ParamsDictionary = Record<string, string>;

interface ParsedQs {
  [key: string]: undefined | string | ParsedQs | (string | ParsedQs)[];
}
