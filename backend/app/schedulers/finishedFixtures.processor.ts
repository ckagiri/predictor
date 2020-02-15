import { from } from 'rxjs';
import { concatMap, filter, flatMap, map, count } from 'rxjs/operators';

import { PredictionStatus } from '../../db/models/prediction.model';
import { IFixture, FixtureStatus } from '../../db/models/fixture.model';
import { IPredictionProcessor, PredictionProcessor } from './prediction.processor';
import { IFixtureRepository, FixtureRepository } from '../../db/repositories/fixture.repo';

export interface IFinishedFixturesProcessor {
  processPredictions(fixtures: IFixture[]): Promise<number>;
  setToTrueAllPredictionsProcessed(fixtures: IFixture[]): Promise<number>;
}

export class FinishedFixturesProcessor implements IFinishedFixturesProcessor {
  public static getInstance() {
    return new FinishedFixturesProcessor(
      PredictionProcessor.getInstance(),
      FixtureRepository.getInstance(),
    );
  }

  constructor(
    private predictionProcessor: IPredictionProcessor,
    private fixtureRepo: IFixtureRepository,
  ) {}

  public processPredictions(fixtures: IFixture[]) {
    return from(fixtures)
      .pipe(
        filter(fixture => {
          return (
            fixture.status === FixtureStatus.FINISHED && fixture.allPredictionsProcessed === false
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
          return this.predictionProcessor.processPrediction$(prediction, fixture);
        }),
      )
      .pipe(count())
      .toPromise();
  }

  public setToTrueAllPredictionsProcessed(fixtures: IFixture[]) {
    return from(fixtures)
      .pipe(
        filter(fixture => {
          return (
            fixture.status === FixtureStatus.FINISHED && fixture.allPredictionsProcessed === false
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
