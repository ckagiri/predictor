import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getSeasonValidator } from './seasons.validator.js';
import GetSeasonUseCase, {
  RequestModel,
} from './useCases/getSeason.useCase.js';

class GetSeasonController {
  constructor(
    private readonly useCase: GetSeasonUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: GetSeasonUseCase,
    validation = getSeasonValidator
  ) {
    return new GetSeasonController(useCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const requestValidated = await this.validation.validate<RequestModel>({
      competition: request.params.competition,
      slug: request.params.slug,
    });

    if (requestValidated.isFailure) {
      throw requestValidated as FailureResult<AppError>;
    }

    const requestModel = requestValidated.value!;
    await this.useCase.execute(requestModel);
  }
}

export const makeGetSeasonController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = GetSeasonUseCase.getInstance(okResponder);
  return GetSeasonController.getInstance(useCase);
};
