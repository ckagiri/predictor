import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import { AppError } from '../../common/AppError.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getSeasonMatchesValidator as getMatchesValidator } from '../controller.validators.js';
import GetSeasonMatchesUseCase, {
  RequestModel,
} from './useCases/getSeasonMatches.useCase.js';

class GetSeasonMatchesController {
  constructor(
    private readonly getMatchesUseCase: GetSeasonMatchesUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    getMatchesUseCase: GetSeasonMatchesUseCase,
    validation = getMatchesValidator
  ) {
    return new GetSeasonMatchesController(getMatchesUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { competition, season } = request.params;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      season,
    });
    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getMatchesUseCase.execute(requestModel);
  }
}

export const makeGetSeasonMatchesController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getMatchesUseCase = GetSeasonMatchesUseCase.getInstance(okResponder);
  return GetSeasonMatchesController.getInstance(getMatchesUseCase);
};
