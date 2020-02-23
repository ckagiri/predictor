import { from } from 'rxjs';
import { concatMap, filter, flatMap, map, count } from 'rxjs/operators';

import { PredictionStatus } from '../../db/models/prediction.model';
import { FixtureEntity, FixtureStatus } from '../../db/models/fixture.model';
import {
  IPredictionProcessor,
  PredictionProcessor,
} from './prediction.processor';
import {
  FixtureRepository,
  FixtureRepositoryImpl,
} from '../../db/repositories/fixture.repo';

export interface FinishedFixturesProcessor {
  processPredictions(fixtures: FixtureEntity[]): Promise<number>;
  setToTrueAllPredictionsProcessed(fixtures: FixtureEntity[]): Promise<number>;
}

export class FinishedFixturesProcessorImpl implements FinishedFixturesProcessor {
  public static getInstance() {
    return new FinishedFixturesProcessorImpl(
      PredictionProcessor.getInstance(),
      FixtureRepositoryImpl.getInstance(),
    );
  }

  constructor(
    private predictionProcessor: IPredictionProcessor,
    private fixtureRepo: FixtureRepository,
  ) { }

  public processPredictions(fixtures: FixtureEntity[]) {
    return from(fixtures)
      .pipe(
        filter(fixture => {
          return (
            fixture.status === FixtureStatus.FINISHED &&
            fixture.allPredictionsProcessed === false
          );
        }),
      )
      .pipe(
        concatMap(fixture => {
          return this.predictionProcessor
            .getPredictions$(fixture)
            .pipe(
              flatMap(predictions => {
                return from(predictions);
              }),
            )
            .pipe(
              map(prediction => {
                return { fixture, prediction };
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
          const { fixture, prediction } = data;
          return this.predictionProcessor.processPrediction$(
            prediction,
            fixture,
          );
        }),
      )
      .pipe(count())
      .toPromise();
  }

  public setToTrueAllPredictionsProcessed(fixtures: FixtureEntity[]) {
    return from(fixtures)
      .pipe(
        filter(fixture => {
          return (
            fixture.status === FixtureStatus.FINISHED &&
            fixture.allPredictionsProcessed === false
          );
        }),
      )
      .pipe(
        flatMap(fixture => {
          return this.fixtureRepo.findByIdAndUpdate$(fixture.id!, {
            allPredictionsProcessed: true,
          });
        }),
      )
      .pipe(count())
      .toPromise();
  }
}
