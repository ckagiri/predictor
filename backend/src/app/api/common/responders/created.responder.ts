import { Response } from 'express';

import Responder from './Responder';

export default class CreatedResponder implements Responder {
  constructor(private readonly res: Response) {}

  respond(value: any): void {
    this.res.status(201).json(value);
  }
}
