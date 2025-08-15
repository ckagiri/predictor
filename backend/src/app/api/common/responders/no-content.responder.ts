import { Response } from 'express';

import Responder from './Responder';

export default class NoContentResponder implements Responder {
  constructor(private readonly res: Response) {}

  respond(): void {
    this.res.sendStatus(204);
  }
}
