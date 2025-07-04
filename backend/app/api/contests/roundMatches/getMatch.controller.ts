import { Response } from 'express';

import AppError from '../../common/AppError.js';
import Controller from '../../common/interfaces/Controller.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getMatchValidator } from '../controller.validators.js';
import GetMatchUseCase, { RequestModel } from './useCases/getMatch.useCase.js';

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
    const match = request.params.match;
    const requestValidated = await this.validation.validate<RequestModel>({
      loggedInUserId,
      match,
    });

    if (requestValidated.isFailure) {
      throw requestValidated as FailureResult<AppError>;
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
