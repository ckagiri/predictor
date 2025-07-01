import { Response } from 'express';

import { AppError } from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getSeasonMatchValidator as getMatchValidator } from './matches.validator.js';
import GetSeasonMatchUseCase, {
  RequestModel,
} from './useCases/getSeasonMatch.useCase.js';

class GetSeasonMatchController {
  constructor(
    private readonly getMatchUseCase: GetSeasonMatchUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    getMatchUseCase: GetSeasonMatchUseCase,
    validation = getMatchValidator
  ) {
    return new GetSeasonMatchController(getMatchUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { competition, season, slug } = request.params;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      season,
      slug,
    });

    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getMatchUseCase.execute(requestModel);
  }
}

export const makeGetSeasonMatchController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getMatchUseCase = GetSeasonMatchUseCase.getInstance(okResponder);
  return GetSeasonMatchController.getInstance(getMatchUseCase);
};
