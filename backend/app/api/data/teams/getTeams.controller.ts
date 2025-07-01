import { Response } from 'express';

import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import GetTeamsUseCase from './useCases/getTeams.useCase.js';

class GetTeamsController {
  constructor(private readonly getTeamsUseCase: GetTeamsUseCase) {}

  static getInstance(getTeamsUseCase: GetTeamsUseCase) {
    return new GetTeamsController(getTeamsUseCase);
  }

  async processRequest(_request: HttpRequestModel): Promise<void> {
    await this.getTeamsUseCase.execute();
  }
}

export const makeGetTeamsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getTeamsUseCase = GetTeamsUseCase.getInstance(okResponder);
  return GetTeamsController.getInstance(getTeamsUseCase);
};
