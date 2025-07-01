import { Response } from 'express';

import { AppError } from '../../common/AppError.js';
import Controller from '../../common/interfaces/Controller.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getCompetitionValidator } from './competitions.validator.js';
import GetCompetitionUseCase from './useCases/getCompetition.useCase.js';

class GetCompetitionController implements Controller {
  constructor(
    private readonly getCompetitionUseCase: GetCompetitionUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    getCompetitionUseCase: GetCompetitionUseCase,
    validation = getCompetitionValidator
  ) {
    return new GetCompetitionController(getCompetitionUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const requestValidated = await this.validation.validate<{ slug: string }>({
      slug: request.params.slug,
    });

    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getCompetitionUseCase.execute(requestModel.slug);
  }
}

export const makeGetCompetitionController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getCompetitionUseCase = GetCompetitionUseCase.getInstance(okResponder);
  return GetCompetitionController.getInstance(getCompetitionUseCase);
};
