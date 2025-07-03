import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getSeasonTeamsValidator } from './seasonTeams.validator.js';
import GetSeasonTeamsUseCase, {
  RequestModel,
} from './useCases/getSeasonTeams.useCase.js';

class GetSeasonTeamsController {
  constructor(
    private readonly getSeasonTeamsUseCase: GetSeasonTeamsUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    getSeasonTeamsUseCase: GetSeasonTeamsUseCase,
    validation = getSeasonTeamsValidator
  ) {
    return new GetSeasonTeamsController(getSeasonTeamsUseCase, validation);
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
    await this.getSeasonTeamsUseCase.execute(requestModel);
  }
}

export const makeGetSeasonTeamsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getSeasonTeamsUseCase = GetSeasonTeamsUseCase.getInstance(okResponder);
  return GetSeasonTeamsController.getInstance(getSeasonTeamsUseCase);
};
