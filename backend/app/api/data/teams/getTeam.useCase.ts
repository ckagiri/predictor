import { lastValueFrom } from 'rxjs';

import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../../../db/repositories/team.repo.js';
import { ValueNotFoundError } from '../../common/errors/index.js';
import Responder from '../../common/responders/Responder.js';
import Result from '../../common/result/index.js';

export default class GetTeamUseCase {
  constructor(
    private responder: Responder,
    private teamRepo: TeamRepository
  ) {}

  public static getInstance(
    responder: Responder,
    teamRepo = TeamRepositoryImpl.getInstance()
  ) {
    return new GetTeamUseCase(responder, teamRepo);
  }

  async execute(teamId: string): Promise<void> {
    try {
      const foundTeam = await lastValueFrom(this.teamRepo.findById$(teamId));

      if (!foundTeam) {
        throw Result.fail(
          new ValueNotFoundError(`Could not find team with id ${teamId}`),
          'Not Found'
        );
      }
      this.responder.respond(foundTeam);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(err, 'Internal Server Error');
    }
  }
}
