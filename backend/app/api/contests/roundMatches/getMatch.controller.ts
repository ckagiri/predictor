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
    private readonly useCase: GetMatchUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(useCase: GetMatchUseCase, validation = getMatchValidator) {
    return new GetMatchController(useCase, validation);
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
    await this.useCase.execute(requestModel);
  }
}

export const makeGetMatchController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = GetMatchUseCase.getInstance(okResponder);
  return GetMatchController.getInstance(useCase);
};
