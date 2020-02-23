import { from } from 'rxjs';
import { concatMap, filter, flatMap, map, count } from 'rxjs/operators';

import { PredictionStatus } from '../../db/models/prediction.model';
import { MatchEntity, MatchStatus } from '../../db/models/match.model';
import {
  IPredictionProcessor,
  PredictionProcessor,
} from './prediction.processor';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../db/repositories/match.repo';

export interface FinishedMatchesProcessor {
  processPredictions(matches: MatchEntity[]): Promise<number>;
  setToTrueAllPredictionsProcessed(matches: MatchEntity[]): Promise<number>;
}

export class FinishedMatchesProcessorImpl implements FinishedMatchesProcessor {
  public static getInstance() {
    return new FinishedMatchesProcessorImpl(
      PredictionProcessor.getInstance(),
      MatchRepositoryImpl.getInstance(),
    );
  }

  constructor(
    private predictionProcessor: IPredictionProcessor,
    private matchRepo: MatchRepository,
  ) {}

  public processPredictions(matches: MatchEntity[]) {
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
        concatMap(match => {
          return this.predictionProcessor
            .getPredictions$(match)
            .pipe(
              flatMap(predictions => {
                return from(predictions);
              }),
            )
            .pipe(
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

  public setToTrueAllPredictionsProcessed(matches: MatchEntity[]) {
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
