import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getSeasonMatchesValidator as getMatchesValidator } from './matches.validator.js';
import GetSeasonMatchesUseCase, {
  RequestModel,
} from './useCases/getSeasonMatches.useCase.js';

class GetSeasonMatchesController {
  constructor(
    private readonly useCase: GetSeasonMatchesUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: GetSeasonMatchesUseCase,
    validation = getMatchesValidator
  ) {
    return new GetSeasonMatchesController(useCase, validation);
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

export const makeGetSeasonMatchesController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = GetSeasonMatchesUseCase.getInstance(okResponder);
  return GetSeasonMatchesController.getInstance(useCase);
};
