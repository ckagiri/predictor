import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import { AppError } from '../../common/AppError.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getCompetitionMatchesValidator as getMatchesValidator } from './matches.validator.js';
import GetCompetitionMatchesUseCase, {
  RequestModel,
} from './useCases/getCompetitionMatches.useCase.js';

class GetCompetitionMatchesController {
  constructor(
    private readonly getMatchesUseCase: GetCompetitionMatchesUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    getMatchesUseCase: GetCompetitionMatchesUseCase,
    validation = getMatchesValidator
  ) {
    return new GetCompetitionMatchesController(getMatchesUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { competition } = request.params;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
    });
    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getMatchesUseCase.execute(requestModel);
  }
}

export const makeGetCompetitionMatchesController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getMatchesUseCase =
    GetCompetitionMatchesUseCase.getInstance(okResponder);
  return GetCompetitionMatchesController.getInstance(getMatchesUseCase);
};
