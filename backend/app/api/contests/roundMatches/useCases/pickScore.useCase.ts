import { lastValueFrom } from 'rxjs';

import { Score } from '../../../../../common/score.js';
import { Match, Prediction } from '../../../../../db/models/index.js';
import { CompetitionRepositoryImpl } from '../../../../../db/repositories/competition.repo.js';
import { GameRoundRepositoryImpl } from '../../../../../db/repositories/gameRound.repo.js';
import { MatchRepositoryImpl } from '../../../../../db/repositories/match.repo.js';
import { PredictionRepositoryImpl } from '../../../../../db/repositories/prediction.repo.js';
import { SeasonRepositoryImpl } from '../../../../../db/repositories/season.repo.js';
import { UserRepositoryImpl } from '../../../../../db/repositories/user.repo.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import GetRoundMatchesUseCase from './getRoundMatches.useCase.js';

export interface RequestModel {
  competition: string;
  loggedInUserId: string;
  predictionSlip: Record<string, string>;
  round?: string;
  season?: string;
}

export default class PickScore extends GetRoundMatchesUseCase {
  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    roundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    userRepo = UserRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new PickScore(
      responder,
      competitionRepo,
      seasonRepo,
      roundRepo,
      matchRepo,
      userRepo,
      predictionRepo
    );
  }
  async execute({
    competition,
    loggedInUserId,
    predictionSlip,
    round,
    season,
  }: RequestModel): Promise<void> {
    try {
      const foundCompetition = await this.findCompetition(competition);
      const foundSeason = await this.findSeason(foundCompetition, season);
      const [foundRound] = await this.findRound(foundSeason, round);

      const roundMatches = (await this.getRoundMatches(
        foundRound.id!
      )) as Match[];
      const picks = await this.pickScores(
        loggedInUserId,
        roundMatches,
        predictionSlip
      );
      this.responder.respond(picks);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create(
          'request-failed',
          'Failed to pick prediction scores',
          err
        ),
        'Internal Server Error'
      );
    }
  }

  private async pickScores(
    userId: string,
    roundMatches: Match[],
    predictionSlip: Record<string, string>
  ) {
    const picks = [] as Prediction[];
    for (const [matchSlug, choice] of Object.entries(predictionSlip)) {
      const match = roundMatches.find(m => m.slug === matchSlug);
      if (match == undefined) continue;
      const score = choice.split('-');
      const goalsHomeTeam = Number(score[0]);
      const goalsAwayTeam = Number(score[1]);
      const scoreChoice: Score = { goalsAwayTeam, goalsHomeTeam };
      const pick = await lastValueFrom(
        this.predictionRepo.pickScore$(userId, match, roundMatches, scoreChoice)
      );
      if (pick) {
        picks.push(pick);
      }
    }
    return picks;
  }
}
