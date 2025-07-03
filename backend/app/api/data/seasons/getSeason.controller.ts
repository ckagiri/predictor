import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getSeasonValidator } from './seasons.validator.js';
import GetSeasonUseCase, {
  RequestModel,
} from './useCases/getSeason.useCase.js';

class GetSeasonController {
  constructor(
    private readonly getSeasonUseCase: GetSeasonUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    getSeasonUseCase: GetSeasonUseCase,
    validation = getSeasonValidator
  ) {
    return new GetSeasonController(getSeasonUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const requestValidated = await this.validation.validate<RequestModel>({
      competition: request.params.competition,
      slug: request.params.slug,
    });

    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getSeasonUseCase.execute(requestModel);
  }
}

export const makeGetSeasonController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getSeasonUseCase = GetSeasonUseCase.getInstance(okResponder);
  return GetSeasonController.getInstance(getSeasonUseCase);
};
