import { Response } from 'express';

import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import GetContestsUseCase from './useCases/getContests.useCase.js';

class GetContestsController {
  constructor(private readonly useCase: GetContestsUseCase) {}

  static getInstance(useCase: GetContestsUseCase) {
    return new GetContestsController(useCase);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const requestModel = {
      loggedInUserId: request.auth?.id,
    };
    await this.useCase.execute(requestModel);
  }
}

export const makeGetContestsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = GetContestsUseCase.getInstance(okResponder);
  return GetContestsController.getInstance(useCase);
};
