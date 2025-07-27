import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getRoundMatchesValidator as getMatchesValidator } from './matches.validator.js';
import GetRoundMatchesUseCase, {
  RequestModel,
} from './useCases/getRoundMatches.useCase.js';

class GetRoundMatchesController {
  constructor(
    private readonly useCase: GetRoundMatchesUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: GetRoundMatchesUseCase,
    validation = getMatchesValidator
  ) {
    return new GetRoundMatchesController(useCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { competition, round, season } = request.params;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      round,
      season,
    });
    if (requestValidated.isFailure) {
      throw requestValidated as FailureResult<AppError>;
    }

    const requestModel = requestValidated.value!;
    await this.useCase.execute(requestModel);
  }
}

export const makeGetRoundMatchesController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = GetRoundMatchesUseCase.getInstance(okResponder);
  return GetRoundMatchesController.getInstance(useCase);
};
