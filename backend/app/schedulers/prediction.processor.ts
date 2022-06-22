import { from, mergeMap, Observable } from 'rxjs';
import { count, map } from 'rxjs/operators';
import { Match } from '../../db/models';
import { MatchRepository, MatchRepositoryImpl } from '../../db/repositories/match.repo';
import { PredictionRepository, PredictionRepositoryImpl } from '../../db/repositories/prediction.repo';
import PredictionCalculator from './prediction.calculator';

export interface PredictionProcessor {
  calculatePredictionPoints(match: Match): Observable<number>;
}

export class PredictionProcessorImpl implements PredictionProcessor {
  public static getInstance(
    matchRepo?: MatchRepository,
    predictionRepo?: PredictionRepository,
    predictionCalculator?: PredictionCalculator,
  ) {
    const matchRepoImpl = matchRepo ?? MatchRepositoryImpl.getInstance();
    const predictionRepoImpl = predictionRepo ?? PredictionRepositoryImpl.getInstance(matchRepoImpl);
    const predictionCalc = predictionCalculator ?? PredictionCalculator.getInstance();
    return new PredictionProcessorImpl(
      matchRepoImpl, predictionRepoImpl, predictionCalc,
    );
  }

  constructor(
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository,
    private predictionCalculator: PredictionCalculator,
  ) { }

  public calculatePredictionPoints(match: Match): Observable<number> {
    const { season, gameRound, result } = match;

    return this.predictionRepo.distinct$('user', { season })
      .pipe(
        mergeMap(users => from(users)),
        mergeMap(user => {
          return this.predictionRepo.findOrCreatePredictions$(user, gameRound)
        }),
        mergeMap(predictions => from(predictions)),
        mergeMap(prediction => {
          const { choice } = prediction;
          const scorePoints = this.predictionCalculator.calculateScore(result!, choice);
          return this.predictionRepo.findByIdAndUpdate$(prediction.id!, { scorePoints })
        }),
        count(),
        mergeMap(predsUpdated => {
          return this.matchRepo.findByIdAndUpdate$(match.id!, { allPredictionPointsCalculated: true })
            .pipe(map(() => predsUpdated))
        }),
      )
  }
}
