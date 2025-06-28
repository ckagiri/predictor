import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import { AppError } from '../../common/AppError.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import GetRoundsUseCase, { RequestModel } from './getRounds.useCase.js';
import { getRoundsValidator } from './rounds.validator.js';

class GetRoundsController {
  constructor(
    private readonly getRoundsUseCase: GetRoundsUseCase,
    private readonly validation: Validator
  ) {}

  public static getInstance(
    getRoundsUseCase: GetRoundsUseCase,
    validation = getRoundsValidator
  ) {
    return new GetRoundsController(getRoundsUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const requestValidated = await this.validation.validate<RequestModel>({
      competition: request.params.competition,
      season: request.params.season,
    });

    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getRoundsUseCase.execute(requestModel);
  }
}

export const makeGetRoundsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getRoundsUseCase = GetRoundsUseCase.getInstance(okResponder);
  return GetRoundsController.getInstance(getRoundsUseCase);
};
