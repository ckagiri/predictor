import { Response } from 'express';

import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import GetContestsUseCase from './useCases/getContests.useCase.js';

class GetContestsController {
  constructor(private readonly getContestsUseCase: GetContestsUseCase) {}

  static getInstance(getContestsUseCase: GetContestsUseCase) {
    return new GetContestsController(getContestsUseCase);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const requestModel = {
      loggedInUserId: request.auth?.id,
    };
    await this.getContestsUseCase.execute(requestModel);
  }
}

export const makeGetContestsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getContestsUseCase = GetContestsUseCase.getInstance(okResponder);
  return GetContestsController.getInstance(getContestsUseCase);
};
