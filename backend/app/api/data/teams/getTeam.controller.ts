import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import GetTeamUseCase from './getTeam.useCase.js';
import getTeamValidator from './getTeam.validator.js';

class GetTeamController {
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
    const requestValidated = await this.validation.validate<{ id: string }>({
      id: request.params.id,
    });

    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as Error, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getTeamUseCase.execute(requestModel.id);
  }
}

export const makeGetTeamController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getTeamUseCase = GetTeamUseCase.getInstance(okResponder);
  return GetTeamController.getInstance(getTeamUseCase);
};
