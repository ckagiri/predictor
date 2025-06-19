import { Response } from 'express';

import Responder from './Responder';

export default class OkResponder implements Responder {
  private readonly res: Response;

  constructor(res: Response) {
    this.res = res;
  }

  respond(value: any): void {
    if (!value) {
      this.res.status(200).send();
    } else {
      this.res.status(200).json(value);
    }
  }
}
