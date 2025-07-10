import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getSeasonsValidator } from './seasons.validator.js';
import GetSeasonsUseCase from './useCases/getSeasons.useCase.js';

class GetSeasonsController {
  constructor(
    private readonly useCase: GetSeasonsUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: GetSeasonsUseCase,
    validation = getSeasonsValidator
  ) {
    return new GetSeasonsController(useCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const requestValidated = await this.validation.validate<{
      competition: string;
    }>({
      competition: request.params.competition,
    });

    if (requestValidated.isFailure) {
      throw requestValidated as FailureResult<AppError>;
    }

    const requestModel = requestValidated.value!;
    await this.useCase.execute(requestModel.competition);
  }
}

export const makeGetSeasonsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = GetSeasonsUseCase.getInstance(okResponder);
  return GetSeasonsController.getInstance(useCase);
};
