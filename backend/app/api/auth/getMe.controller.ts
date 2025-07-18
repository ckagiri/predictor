import { Response } from 'express';

import AppError from '../common/AppError.js';
import Controller from '../common/interfaces/Controller.js';
import HttpRequestModel from '../common/interfaces/HttpRequestModel.js';
import OkResponder from '../common/responders/ok.responder.js';
import Responder from '../common/responders/Responder.js';
import Result from '../common/result/index.js';
import { mapUserToDto } from './data.mapper.js';
import {
  TokenGenerator,
  TokenGeneratorImpl,
} from './providers/tokenGenerator.js';

class GetMeController implements Controller {
  constructor(
    private readonly responder: Responder,
    private readonly tokenGen: TokenGenerator
  ) {}

  static getInstance(responder: Responder, tokenGen: TokenGenerator) {
    return new GetMeController(responder, tokenGen);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    if (request.auth) {
      await Promise.resolve();
      this.responder.respond({
        user: mapUserToDto(request.auth, this.tokenGen),
      });
    } else {
      throw Result.fail(AppError.unauthorized());
    }
  }
}

export const makeGetMeController = (res: Response) => {
  const okResponder = new OkResponder(res);
  return GetMeController.getInstance(
    okResponder,
    TokenGeneratorImpl.getInstance()
  );
};
