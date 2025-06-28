import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import OkResponder from '../../common/responders/ok.responder.js';
import GetCompetitionsUseCase from './useCases/getCompetitions.useCase.js';

class GetCompetitionsController {
  constructor(
    private readonly getCompetitionsUseCase: GetCompetitionsUseCase
  ) {}

  static getInstance(getCompetitionsUseCase: GetCompetitionsUseCase) {
    return new GetCompetitionsController(getCompetitionsUseCase);
  }

  async processRequest(_request: HttpRequestModel): Promise<void> {
    await this.getCompetitionsUseCase.execute();
  }
}

export const makeGetCompetitionsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getCompetitionsUseCase =
    GetCompetitionsUseCase.getInstance(okResponder);
  return GetCompetitionsController.getInstance(getCompetitionsUseCase);
};
