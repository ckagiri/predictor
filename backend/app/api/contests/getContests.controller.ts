import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import OkResponder from '../common/responders/ok.responder.js';
import GetContestsUseCase from './getContests.useCase.js';

class GetContestsController {
  constructor(private readonly getContestsUseCase: GetContestsUseCase) {}

  static getInstance(getContestsUseCase: GetContestsUseCase) {
    return new GetContestsController(getContestsUseCase);
  }

  async processRequest(_request: HttpRequestModel): Promise<void> {
    await this.getContestsUseCase.execute();
  }
}

export const makeGetContestsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getContestsUseCase = GetContestsUseCase.getInstance(okResponder);
  return GetContestsController.getInstance(getContestsUseCase);
};
