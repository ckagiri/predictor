import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getSeasonMatchValidator as getMatchValidator } from './matches.validator.js';
import GetSeasonMatchUseCase, {
  RequestModel,
} from './useCases/getSeasonMatch.useCase.js';

class GetSeasonMatchController {
  constructor(
    private readonly useCase: GetSeasonMatchUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: GetSeasonMatchUseCase,
    validation = getMatchValidator
  ) {
    return new GetSeasonMatchController(useCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { competition, season, slug } = request.params;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      season,
      slug,
    });

    if (requestValidated.isFailure) {
      throw requestValidated as FailureResult<AppError>;
    }

    const requestModel = requestValidated.value!;
    await this.useCase.execute(requestModel);
  }
}

export const makeGetSeasonMatchController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = GetSeasonMatchUseCase.getInstance(okResponder);
  return GetSeasonMatchController.getInstance(useCase);
};
