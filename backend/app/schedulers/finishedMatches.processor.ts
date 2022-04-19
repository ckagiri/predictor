import { from } from 'rxjs';
import { concatMap, filter, flatMap, map, count } from 'rxjs/operators';

import { PredictionStatus } from '../../db/models/prediction.model';
import { Match, MatchStatus } from '../../db/models/match.model';
import {
  UserRepository,
  UserRepositoryImpl,
} from '../../db/repositories/user.repo';
import {
  PredictionProcessor,
  PredictionProcessorImpl,
} from './prediction.processor';
import {
  PredictionRepository,
  PredictionRepositoryImpl,
} from '../../db/repositories/prediction.repo';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../db/repositories/match.repo';

export interface FinishedMatchesProcessor {
  processPredictions(matches: Match[]): Promise<number | undefined>;
  setToTrueAllPredictionsProcessed(matches: Match[]): Promise<number | undefined>;
}

export class FinishedMatchesProcessorImpl implements FinishedMatchesProcessor {
  public static getInstance(
    userRepo?: UserRepository,
    matchRepo?: MatchRepository,
    predictionRepo?: PredictionRepository
  ) {
    const userRepoImpl = userRepo ?? UserRepositoryImpl.getInstance();
    const matchRepoImpl = matchRepo ?? MatchRepositoryImpl.getInstance();
    const predictionRepoImpl = predictionRepo ?? PredictionRepositoryImpl.getInstance(matchRepoImpl);

    return new FinishedMatchesProcessorImpl(
      PredictionProcessorImpl.getInstance(userRepoImpl, matchRepoImpl, predictionRepoImpl),
      matchRepoImpl,
    );
  }

  constructor(
    private predictionProcessor: PredictionProcessor,
    private matchRepo: MatchRepository,
  ) { }

  public processPredictions(matches: Match[]) {
    return from(matches)
      .pipe(
        filter(match => {
          return (
            match.status === MatchStatus.FINISHED &&
            match.allPredictionsProcessed === false
          );
        }),
      )
      .pipe(
        // why concatMap and not flatMap .. is it process one match at a time
        concatMap(match => {
          return this.predictionProcessor
            .getOrCreatePredictions$(match)
            .pipe(
              flatMap(predictions => predictions),
              map(prediction => {
                return { match, prediction };
              }),
            );
        }),
      )
      .pipe(
        filter(data => {
          return data.prediction.status !== PredictionStatus.PROCESSED;
        }),
      )
      .pipe(
        flatMap(data => {
          const { match, prediction } = data;
          return this.predictionProcessor.processPrediction$(prediction, match);
        }),
      )
      .pipe(count())
      .toPromise();
  }

  public setToTrueAllPredictionsProcessed(matches: Match[]) {
    return from(matches)
      .pipe(
        filter(match => {
          return (
            match.status === MatchStatus.FINISHED &&
            match.allPredictionsProcessed === false
          );
        }),
      )
      .pipe(
        flatMap(match => {
          return this.matchRepo.findByIdAndUpdate$(match.id!, {
            allPredictionsProcessed: true,
          });
        }),
      )
      .pipe(count())
      .toPromise();
  }
}
