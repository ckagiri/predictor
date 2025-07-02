import { Response } from 'express';

import AppError from '../../common/AppError.js';
import Controller from '../../common/interfaces/Controller.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getMatchValidator } from '../controller.validators.js';
import GetMatchUseCase, { RequestModel } from './getMatch.useCase.js';

class GetMatchController implements Controller {
  constructor(
    private readonly getMatchUseCase: GetMatchUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    getMatchUseCase: GetMatchUseCase,
    validation = getMatchValidator
  ) {
    return new GetMatchController(getMatchUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const loggedInUserId = request.auth?.id;
    const matchId = request.params.matchId;
    const requestValidated = await this.validation.validate<RequestModel>({
      loggedInUserId,
      matchId,
    });

    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getMatchUseCase.execute(requestModel);
  }
}

export const makeGetMatchController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getMatchUseCase = GetMatchUseCase.getInstance(okResponder);
  return GetMatchController.getInstance(getMatchUseCase);
};
