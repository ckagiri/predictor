import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getRoundValidator } from './rounds.validator.js';
import GetRoundUseCase, { RequestModel } from './useCases/getRound.useCase.js';

class GetRoundController {
  constructor(
    private readonly getRoundUseCase: GetRoundUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
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
      throw requestValidated as FailureResult<AppError>;
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
