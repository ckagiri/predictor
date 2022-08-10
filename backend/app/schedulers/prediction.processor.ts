import { MatchStatus } from '../../db/models/match.model';
import { count, filter, from, lastValueFrom, map, mergeMap } from 'rxjs';
import { Match } from '../../db/models';
import { PredictionRepository, PredictionRepositoryImpl } from '../../db/repositories/prediction.repo';
import PredictionCalculator from './prediction.calculator';

export interface PredictionProcessor {
  calculatePredictionPoints(seasonId: string, matches: Match[]): Promise<number>;
}

export class PredictionProcessorImpl implements PredictionProcessor {
  public static getInstance(
    predictionRepo = PredictionRepositoryImpl.getInstance(),
    predictionCalculator = PredictionCalculator.getInstance(),
  ) {
    return new PredictionProcessorImpl(predictionRepo, predictionCalculator);
  }

  constructor(
    private predictionRepo: PredictionRepository,
    private predictionCalculator: PredictionCalculator,
  ) { }

  public calculatePredictionPoints(seasonId: string, matchesArray: Match[]): Promise<number> {
    const matches = matchesArray.filter(
      m => m.status === MatchStatus.FINISHED && m.season.toString() === seasonId);
    return lastValueFrom(
      this.predictionRepo.distinct$('user', { season: seasonId })
        .pipe(
          mergeMap(userIds => from(matches)
            .pipe(
              map(match => ({ match, userIds }))
            )
          ),
          mergeMap(({ match, userIds }) => from(userIds)
            .pipe(
              map(userId => ({
                match, userId
              })
              )
            )
          ),
          mergeMap(({ match, userId }) => {
            const matchId = match.id!;
            return this.predictionRepo.findOne$(userId, matchId)
              .pipe(
                map(prediction => ({ match, prediction }))
              )
          }),
          filter(({ prediction }) => prediction != null),
          mergeMap(({ match, prediction }) => {
            const { result } = match;
            const { choice } = prediction;

            const scorePoints = this.predictionCalculator.calculateScore(result!, choice);
            return this.predictionRepo.findByIdAndUpdate$(prediction.id!, { scorePoints })
          }),
          count()
        )
    )
  }
}
