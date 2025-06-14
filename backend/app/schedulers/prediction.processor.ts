import { count, filter, from, lastValueFrom, map, mergeMap, tap } from 'rxjs';

import { Match } from '../../db/models/index.js';
import { MatchStatus } from '../../db/models/match.model.js';
import {
  PredictionRepository,
  PredictionRepositoryImpl,
} from '../../db/repositories/prediction.repo.js';
import PredictionCalculator from './prediction.calculator.js';

export interface PredictionProcessor {
  calculateAndUpdatePredictionPoints(
    seasonId: string,
    matches: Match[]
  ): Promise<number>;
}

export class PredictionProcessorImpl implements PredictionProcessor {
  constructor(
    private predictionRepo: PredictionRepository,
    private predictionCalculator: PredictionCalculator
  ) {}

  public static getInstance(
    predictionRepo = PredictionRepositoryImpl.getInstance(),
    predictionCalculator = PredictionCalculator.getInstance()
  ) {
    return new PredictionProcessorImpl(predictionRepo, predictionCalculator);
  }

  public calculateAndUpdatePredictionPoints(
    seasonId: string,
    seasonMatches: Match[]
  ): Promise<number> {
    const matches = seasonMatches.filter(
      m => m.status === MatchStatus.FINISHED && m.season.toString() === seasonId
    );
    return lastValueFrom(
      this.predictionRepo.distinct$('user', { season: seasonId }).pipe(
        mergeMap(userIds =>
          from(matches).pipe(map(match => ({ match, userIds })))
        ),
        mergeMap(({ match, userIds }) =>
          from(userIds).pipe(map(userId => ({ match, userId })))
        ),
        mergeMap(({ match, userId }) => {
          const matchId = match.id!;
          return this.predictionRepo.findOne$(userId, matchId).pipe(
            map(prediction => ({ match, prediction })),
            filter(({ prediction }) => prediction !== null)
          );
        }),
        mergeMap(({ match, prediction }) => {
          const { result } = match;
          const { choice } = prediction!;

          const scorePoints = this.predictionCalculator.calculateScore(
            result,
            choice
          );
          return this.predictionRepo.findByIdAndUpdate$(prediction!.id, {
            scorePoints,
          });
        }),
        count(),
        tap(count => {
          console.log(`Updated ${count} predictions`);
        })
      )
    );
  }
}
