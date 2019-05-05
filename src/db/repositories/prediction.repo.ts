import { Observable, of, from, throwError } from 'rxjs';
import { filter, first, flatMap, catchError } from 'rxjs/operators';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

import {
  IPrediction,
  IPredictionDocument,
  Prediction,
  PredictionStatus
} from '../models/prediction.model';
import { IFixture } from '../models/fixture.model';
import { FixtureStatus } from '../models/fixture.model';
import { IFixtureRepository, FixtureRepository } from '../repositories/fixture.repo';

import { IBaseRepository, BaseRepository } from './base.repo';

export interface IPredictionRepository extends IBaseRepository<IPrediction> {
  findOrCreateJoker$(
    userId: string,
    seasonId: string,
    gameRound: number,
    pick: string | string[]
  ): Observable<IPrediction>;
}

export class PredictionRepository extends BaseRepository<IPrediction, IPredictionDocument>
  implements IPredictionRepository {
  static getInstance() {
    return new PredictionRepository(FixtureRepository.getInstance(ApiProvider.LIGI));
  }

  private fixtureRepo: IFixtureRepository;

  constructor(fixtureRepo: IFixtureRepository) {
    super(Prediction);
    this.fixtureRepo = fixtureRepo;
  }

  findOrCreateJoker$(
    userId: string,
    seasonId: string,
    gameRound: number,
    pick: string | string[]
  ): Observable<IPrediction> {
    const query: any = {
      user: userId,
      season: seasonId,
      gameRound,
      hasJoker: true
    };
    return this.findOne$(query).pipe(
      flatMap(currentJoker => {
        let newJokerFixtureId: string;
        if (pick instanceof Array) {
          if (currentJoker) {
            return of(currentJoker);
          } else {
            newJokerFixtureId = pick[Math.floor(Math.random() * pick.length)];
            return this.pickJoker$(userId, currentJoker, newJokerFixtureId, true);
          }
        } else {
          newJokerFixtureId = pick;
          if (currentJoker && currentJoker.status === PredictionStatus.PROCESSED) {
            return throwError(new Error('Joker prediction already processed'));
          }
          return this.pickJoker$(userId, currentJoker, newJokerFixtureId, false);
        }
      })
    );
  }

  findOne$(query?: any) {
    const { userId, fixtureId } = query;
    if (userId !== undefined && fixtureId !== undefined) {
      query.user = userId;
      query.fixture = fixtureId;
      delete query.userId;
      delete query.fixtureId;
    }
    return super.findOne$(query);
  }

  private pickJoker$(
    userId: string,
    currentJoker: IPrediction,
    newJokerFixtureId: string,
    autoPicked: boolean
  ) {
    let newJokerFixture: IFixture;
    return this.fixtureRepo
      .findById$(newJokerFixtureId)
      .pipe(
        flatMap(fixture => {
          if (!fixture) {
            return throwError(new Error('Fixture does not exist'));
          }
          newJokerFixture = fixture;
          if (
            autoPicked ||
            newJokerFixture.status === FixtureStatus.SCHEDULED ||
            newJokerFixture.status === FixtureStatus.TIMED
          ) {
            return this.findOne$({ user: userId, fixture: newJokerFixtureId });
          }
          return throwError(new Error('Fixture not scheduled'));
        })
      )
      .pipe(
        catchError((error: any) => {
          return throwError(error);
        })
      )
      .pipe(
        flatMap((newJokerPrediction: IPrediction) => {
          const { slug: fixtureSlug, season, gameRound, odds } = newJokerFixture;
          let newJoker: IPrediction;
          if (!newJokerPrediction) {
            const randomMatchScore = this.getRandomMatchScore();
            newJoker = {
              user: userId,
              fixture: newJokerFixtureId,
              fixtureSlug,
              season,
              gameRound,
              hasJoker: true,
              jokerAutoPicked: autoPicked,
              choice: randomMatchScore
            };
          } else {
            newJoker = newJokerPrediction;
            newJoker.hasJoker = true;
            newJoker.jokerAutoPicked = autoPicked;
          }
          const predictionJokers: IPrediction[] = [newJoker];
          if (currentJoker) {
            currentJoker.hasJoker = false;
            predictionJokers.push(currentJoker);
          }
          return this.saveMany$(predictionJokers);
        })
      )
      .pipe(
        catchError((error: any) => {
          return throwError(error);
        })
      )
      .pipe(
        flatMap(predictions => {
          return from(predictions);
        })
      )
      .pipe(
        filter(prediction => {
          return prediction.fixture.toString() === newJokerFixture.id;
        })
      )
      .pipe(first());
  }

  private getRandomMatchScore() {
    const scoreList = [
      '0-0',
      '1-1',
      '1-1',
      '2-2',
      '1-0',
      '1-0',
      '2-0',
      '2-0',
      '2-0',
      '2-1',
      '2-1',
      '2-1',
      '3-0',
      '3-1',
      '3-2',
      '0-1',
      '0-1',
      '0-1',
      '0-1',
      '0-2',
      '1-2',
      '1-2',
      '0-3',
      '1-3',
      '2-3'
    ];
    const score = scoreList[Math.floor(Math.random() * scoreList.length)].split('-');
    const goalsHomeTeam = Number(score[0]);
    const goalsAwayTeam = Number(score[1]);
    return {
      goalsHomeTeam,
      goalsAwayTeam,
      isComputerGenerated: true
    };
  }
}
