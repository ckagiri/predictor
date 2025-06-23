import { AppError } from 'app/api/common/AppError.js';
import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import Controller from '../../common/interfaces/Controller.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import GetTeamUseCase from './getTeam.useCase.js';
import { getTeamValidator } from './teams.validator.js';

class GetTeamController implements Controller {
  constructor(
    private readonly getTeamUseCase: GetTeamUseCase,
    private readonly validation: Validator
  ) {}

  public static getInstance(
    getTeamUseCase: GetTeamUseCase,
    validation = getTeamValidator
  ) {
    return new GetTeamController(getTeamUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const requestValidated = await this.validation.validate<{ slug: string }>({
      slug: request.params.slug,
    });

    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getTeamUseCase.execute(requestModel.slug);
  }
}

export const makeGetTeamController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getTeamUseCase = GetTeamUseCase.getInstance(okResponder);
  return GetTeamController.getInstance(getTeamUseCase);
};
