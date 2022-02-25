import { Observable, of, from, throwError } from 'rxjs';
import { filter, first, flatMap, catchError } from 'rxjs/operators';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

import PredictionModel, {
  Prediction,
  PredictionDocument,
  PredictionStatus,
} from '../models/prediction.model';
import { Match, MatchStatus } from '../models/match.model';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../repositories/match.repo';
import { Score } from '../../common/score';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface PredictionRepository extends BaseRepository<Prediction> {
  findOrCreateJoker$(
    userId: string,
    gameRoundId: string,
    pick: string | string[],
  ): Observable<Prediction>;
  findOneOrCreate$({
    userId,
    matchId,
  }: {
    userId: string;
    matchId: string;
  }): Observable<Prediction>;
  findOneAndUpsert$(
    { userId, matchId }: { userId: string; matchId: string },
    choice: Score,
  ): Observable<Prediction>;
}

export class PredictionRepositoryImpl
  extends BaseRepositoryImpl<Prediction, PredictionDocument>
  implements PredictionRepository {
  public static getInstance() {
    return new PredictionRepositoryImpl(
      MatchRepositoryImpl.getInstance(ApiProvider.LIGI),
    );
  }

  private matchRepo: MatchRepository;

  constructor(matchRepo: MatchRepository) {
    super(PredictionModel);
    this.matchRepo = matchRepo;
  }

  public findOrCreateJoker$(
    userId: string,
    gameRoundId: string,
    pick: string | string[],
    autoPicked: boolean = true,
  ): Observable<Prediction> {
    const query: any = {
      user: userId,
      gameRound: gameRoundId,
      hasJoker: true,
    };
    // predictions dont have gameRounds
    return this.findOne$(query).pipe(
      flatMap(currentJoker => {
        let newJokerMatchId: string;
        if (pick instanceof Array) {
          if (currentJoker) {
            return of(currentJoker);
          } else {
            newJokerMatchId = pick[Math.floor(Math.random() * pick.length)];
            return this.pickJoker$(userId, currentJoker, newJokerMatchId, autoPicked);
          }
        } else {
          newJokerMatchId = pick;
          if (
            currentJoker &&
            currentJoker.status === PredictionStatus.PROCESSED
          ) {
            return throwError(new Error('Joker prediction already processed'));
          }
          return this.pickJoker$(userId, currentJoker, newJokerMatchId, autoPicked);
        }
      }),
    );
  }

  public findOne$(query?: any) {
    const { userId, matchId } = query;
    // prediction model doesnt have Id suffix for the reference models;
    // here I am expecting the Id suffix and quite sure why
    // why not pass match and user keys, does the name imply a full object?
    if (userId !== undefined && matchId !== undefined) {
      query.user = userId;
      query.match = matchId;
      delete query.userId;
      delete query.matchId;
    }
    return super.findOne$(query);
  }

  public findOneOrCreate$({
    userId,
    matchId,
  }: {
    userId: string;
    matchId: string;
  }) {
    const query = { user: userId, match: matchId };
    return this.findOne$(query).pipe(
      flatMap(prediction => {
        if (prediction) {
          return of(prediction);
        }
        return this.matchRepo.findById$(matchId).pipe(
          flatMap(match => {
            const {
              slug: matchSlug,
              season,
              odds,
            } = match as Required<Match>;
            const pred: Prediction = {
              user: userId,
              match: matchId,
              matchSlug,
              season,
              choice: {} as any,
            };
            const randomMatchScore = this.getRandomMatchScore();
            pred.choice = randomMatchScore;
            return this.save$(pred);
          }),
        );
      }),
    );
  }

  public findOneAndUpsert$(
    { userId, matchId }: { userId: string; matchId: string },
    choice: Score,
  ) {
    return throwError(new Error('method not implemented'));
  }

  private pickJoker$(
    userId: string,
    currentJoker: Prediction,
    newJokerMatchId: string,
    autoPicked: boolean,
  ) {
    let newJokerMatch: Match;
    return this.matchRepo
      .findById$(newJokerMatchId)
      .pipe(
        flatMap(match => {
          if (!match) {
            return throwError(new Error('Match does not exist'));
          }
          newJokerMatch = match;
          if (
            autoPicked ||
            newJokerMatch.status === MatchStatus.SCHEDULED ||
            newJokerMatch.status === MatchStatus.TIMED
          ) {
            return this.findOne$({ user: userId, match: newJokerMatchId });
          }
          return throwError(new Error('Match not scheduled'));
        }),
      )
      .pipe(
        catchError((error: any) => {
          return throwError(error);
        }),
      )
      .pipe(
        flatMap((newJokerPrediction: Prediction) => {
          const {
            slug: matchSlug,
            season,
            gameRound,
            odds,
          } = newJokerMatch as Required<Match>;
          let newJoker: Prediction;
          if (!newJokerPrediction) {
            const randomMatchScore = this.getRandomMatchScore();
            newJoker = {
              user: userId,
              match: newJokerMatchId,
              matchSlug,
              season,
              gameRound,
              hasJoker: true,
              jokerAutoPicked: autoPicked,
              choice: randomMatchScore,
            };
          } else {
            newJoker = newJokerPrediction;
            newJoker.hasJoker = true;
            newJoker.jokerAutoPicked = autoPicked;
          }
          const predictionJokers: Prediction[] = [newJoker];
          if (currentJoker) {
            currentJoker.hasJoker = false;
            predictionJokers.push(currentJoker);
          }
          return this.saveMany$(predictionJokers);
        }),
      )
      .pipe(
        catchError((error: any) => {
          return throwError(error);
        }),
      )
      .pipe(
        flatMap(predictions => {
          return from(predictions);
        }),
      )
      .pipe(
        filter(prediction => {
          return prediction.match.toString() === newJokerMatch.id;
        }),
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
      '2-3',
    ];
    const score = scoreList[Math.floor(Math.random() * scoreList.length)].split(
      '-',
    );
    const goalsHomeTeam = Number(score[0]);
    const goalsAwayTeam = Number(score[1]);
    return {
      goalsHomeTeam,
      goalsAwayTeam,
      isComputerGenerated: true,
    };
  }
}
