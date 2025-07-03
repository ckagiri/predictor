import { lastValueFrom } from 'rxjs';

import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../../../../db/repositories/team.repo.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';

export default class GetTeamsUseCase {
  constructor(
    private responder: Responder,
    private teamRepo: TeamRepository
  ) {}

  static getInstance(
    responder: Responder,
    teamRepo = TeamRepositoryImpl.getInstance()
  ) {
    return new GetTeamsUseCase(responder, teamRepo);
  }

  async execute(): Promise<void> {
    try {
      const foundTeams = await lastValueFrom(this.teamRepo.findAll$());

      this.responder.respond(foundTeams);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create(
          'fetch-failed',
          'Competitions could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
