import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import { AppError } from '../../common/AppError.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getRoundMatchesValidator as getMatchesValidator } from '../controller.validators.js';
import GetRoundMatchesUseCase, {
  RequestModel,
} from './useCases/getRoundMatches.useCase.js';

class GetRoundMatchesController {
  constructor(
    private readonly getMatchesUseCase: GetRoundMatchesUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    getMatchesUseCase: GetRoundMatchesUseCase,
    validation = getMatchesValidator
  ) {
    return new GetRoundMatchesController(getMatchesUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { competition, round, season } = request.params;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      round,
      season,
    });
    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getMatchesUseCase.execute(requestModel);
  }
}

export const makeGetRoundMatchesController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getMatchesUseCase = GetRoundMatchesUseCase.getInstance(okResponder);
  return GetRoundMatchesController.getInstance(getMatchesUseCase);
};
