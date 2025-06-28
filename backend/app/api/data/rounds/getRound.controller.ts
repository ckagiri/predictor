import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import { AppError } from '../../common/AppError.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import GetRoundUseCase, { RequestModel } from './getRound.useCase.js';
import { getRoundValidator } from './rounds.validator.js';

class GetRoundController {
  constructor(
    private readonly getRoundUseCase: GetRoundUseCase,
    private readonly validation: Validator
  ) {}

  public static getInstance(
    getRoundUseCase: GetRoundUseCase,
    validation = getRoundValidator
  ) {
    return new GetRoundController(getRoundUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const requestValidated = await this.validation.validate<RequestModel>({
      competition: request.params.competition,
      season: request.params.season,
      slug: request.params.slug,
    });

    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getRoundUseCase.execute(requestModel);
  }
}

export const makeGetRoundController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getRoundUseCase = GetRoundUseCase.getInstance(okResponder);
  return GetRoundController.getInstance(getRoundUseCase);
};
