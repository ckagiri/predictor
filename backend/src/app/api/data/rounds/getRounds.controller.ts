import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getRoundsValidator } from './rounds.validator.js';
import GetRoundsUseCase, {
  RequestModel,
} from './useCases/getRounds.useCase.js';

class GetRoundsController {
  constructor(
    private readonly useCase: GetRoundsUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: GetRoundsUseCase,
    validation = getRoundsValidator
  ) {
    return new GetRoundsController(useCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const requestValidated = await this.validation.validate<RequestModel>({
      competition: request.params.competition,
      season: request.params.season,
    });

    if (requestValidated.isFailure) {
      throw requestValidated as FailureResult<AppError>;
    }

    const requestModel = requestValidated.value!;
    await this.useCase.execute(requestModel);
  }
}

export const makeGetRoundsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = GetRoundsUseCase.getInstance(okResponder);
  return GetRoundsController.getInstance(useCase);
};
