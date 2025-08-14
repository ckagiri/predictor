import { compact, flatMap, head, isEmpty, uniq } from 'lodash';
import { ProjectionType } from 'mongoose';
import { from, iif, Observable, of, throwError } from 'rxjs';
import { filter, map, mergeAll, mergeMap, toArray } from 'rxjs/operators';

import { Score } from '../../common/score.js';
import { VosePredictorImpl } from '../helpers/vosePredictor.js';
import { Match, MatchStatus } from '../models/match.model.js';
import PredictionModel, { Prediction } from '../models/prediction.model.js';
import { BaseRepository, BaseRepositoryImpl } from './base.repo.js';

export interface PredictionRepository extends BaseRepository<Prediction> {
  findJokers$(userId: string, roundMatches: Match[]): Observable<Prediction[]>;
  findJokersByMatch$(matchId: string): Observable<Prediction[]>;
  findOneByUserAndMatch$(
    userId: string,
    matchId: string,
    projection?: ProjectionType<Prediction> | null
  ): Observable<null | Prediction>;
  findOrCreateJoker$(
    userId: string,
    roundMatches: Match[]
  ): Observable<null | Prediction>;
  findOrCreatePicks$(
    userId: string,
    roundMatches: Match[],
    withJoker?: boolean
  ): Observable<Prediction[]>;
  findOrCreatePredictions$(
    userId: string,
    roundMatches: Match[],
    withJoker?: boolean
  ): Observable<Prediction[]>;
  pickJoker$(
    userId: string,
    match: Match,
    roundMatches: Match[]
  ): Observable<Prediction[]>;
  pickScore$(
    userId: string,
    match: Match,
    roundMatches: Match[],
    choice: Score
  ): Observable<Prediction | null>;
  repickJokerIfMatch(
    matchId: string,
    roundMatches: Match[]
  ): Observable<number>;
}

export class PredictionRepositoryImpl
  extends BaseRepositoryImpl<Prediction>
  implements PredictionRepository
{
  constructor() {
    super(PredictionModel);
  }

  static getInstance(): PredictionRepository {
    return new PredictionRepositoryImpl();
  }

  findJokers$(userId: string, roundMatches: Match[]): Observable<Prediction[]> {
    return this.findAll$({
      hasJoker: true,
      match: { $in: roundMatches.map(m => m.id) },
      user: userId,
    });
  }

  findJokersByMatch$(matchId: string): Observable<Prediction[]> {
    return this.findAll$({
      hasJoker: true,
      match: matchId,
    });
  }

  findOneByUserAndMatch$(
    userId: string,
    matchId: string,
    projection?: any
  ): Observable<null | Prediction> {
    return this.findOne$({ match: matchId, user: userId }, projection);
  }

  findOrCreateJoker$(
    userId: string,
    roundMatches: Match[]
  ): Observable<null | Prediction> {
    const matchIds = roundMatches.map(m => m.id);
    return this.findJokers$(userId, roundMatches).pipe(
      mergeMap(jokerPredictions => {
        if (jokerPredictions.length === 1) {
          return of(head(jokerPredictions));
        }
        if (jokerPredictions.length > 1) {
          // Precautionary
          const getTime = (date?: Date | number | string): number =>
            date != null ? new Date(date).getTime() : 0;
          const [, ...otherJokers] = jokerPredictions.sort(
            (a: Prediction, b) => {
              return getTime(b.createdAt) - getTime(a.createdAt);
            }
          );
          otherJokers.forEach(j => {
            j.hasJoker = false;
            j.jokerAutoPicked = false;
          });
          return this.updateMany$(otherJokers);
        }
        if (jokerPredictions.length === 0) {
          const selectableMatches = roundMatches.filter(
            m => m.status === MatchStatus.SCHEDULED
          );
          if (selectableMatches.length === 0) {
            return of(undefined);
          }
          const jokerMatch =
            selectableMatches[
              Math.floor(Math.random() * selectableMatches.length)
            ];
          const jokerMatchId = jokerMatch.id!;
          return this.findOneByUserAndMatch$(userId, jokerMatchId).pipe(
            mergeMap(jokerPred => {
              if (jokerPred) {
                jokerPred.hasJoker = true;
                jokerPred.jokerAutoPicked = true;
                return this.findByIdAndUpdate$(jokerPred.id!, jokerPred);
              } else {
                const { season, slug } = jokerMatch;
                const randomScore = VosePredictorImpl.getDefault().predict();

                const newJokerPred: Prediction = {
                  choice: this.getPredictionScore(randomScore),
                  hasJoker: true,
                  jokerAutoPicked: true,
                  match: jokerMatchId,
                  matchSlug: slug,
                  season,
                  user: userId,
                };
                return this.create$(newJokerPred);
              }
            })
          );
        }
        // Ensure all code paths return an Observable
        return of(undefined);
      }),
      mergeMap(result => {
        if (
          result?.constructor &&
          result.constructor.name === 'BulkWriteResult'
        ) {
          return this.findOne$({
            hasJoker: true,
            match: { $in: matchIds },
            user: userId,
          });
        }
        return of(result as Prediction);
      })
    );
  }

  findOrCreatePicks$(
    userId: string,
    roundMatches: Match[],
    withJoker = true
  ): Observable<Prediction[]> {
    return this.findOrCreatePredictions$(userId, roundMatches, withJoker).pipe(
      mergeMap(predictions => {
        return from(predictions).pipe(
          filter(prediction => {
            return Boolean(prediction.choice.isComputerGenerated);
          }),
          map(prediction => {
            const predictionMatch = roundMatches.find(
              m => m.id === prediction.match.toString()
            );
            const randomScore = VosePredictorImpl.getInstance(
              predictionMatch?.odds
            ).predict();
            const isComputerGenerated = false;
            prediction.choice = this.getPredictionScore(
              randomScore,
              isComputerGenerated
            );
            if (prediction.hasJoker) {
              prediction.jokerAutoPicked = false;
            }
            return prediction;
          }),
          toArray()
        );
      }),
      mergeMap(newPicks => {
        return iif(
          () => Boolean(newPicks.length),
          this.updateMany$(newPicks),
          of(undefined)
        );
      }),
      mergeMap(() => {
        return this.findAll$({
          'choice.isComputerGenerated': false,
          match: { $in: roundMatches.map(m => m.id) },
          user: userId,
        });
      })
    );
  }

  findOrCreatePredictions$(
    userId: string,
    roundMatches: Match[],
    withJoker = true
  ): Observable<Prediction[]> {
    return iif(
      () => withJoker,
      this.findOrCreateJoker$(userId, roundMatches),
      of(undefined)
    ).pipe(
      mergeMap(() => {
        return this.findAll$({
          match: { $in: roundMatches.map(n => n.id) },
          user: userId,
        });
      }),
      mergeMap(predictions => {
        const scheduledMatches: Match[] = roundMatches.filter(
          m => m.status === MatchStatus.SCHEDULED
        );
        const predictionMatchIds: string[] = predictions.map(p =>
          p.match.toString()
        );
        const newPredictionMatches = scheduledMatches.filter(
          m => !predictionMatchIds.includes(m.id!)
        );
        if (isEmpty(newPredictionMatches)) {
          return of(predictions);
        }

        const defaultVosePredictor = VosePredictorImpl.getDefault();
        const newPredictions = newPredictionMatches.map(match => {
          const { id: matchId, season, slug: matchSlug } = match;
          const score = defaultVosePredictor.predict();
          const prediction: Prediction = {
            choice: this.getPredictionScore(score),
            match: matchId!,
            matchSlug,
            season,
            user: userId,
          };
          return prediction;
        });
        return this.insertMany$(newPredictions).pipe(
          mergeMap(() => {
            return this.findAll$({
              match: { $in: roundMatches.map(m => m.id) },
              user: userId,
            });
          })
        );
      })
    );
  }

  pickJoker$(
    userId: string,
    match: Match,
    roundMatches: Match[]
  ): Observable<Prediction[]> {
    if (match.status !== MatchStatus.SCHEDULED) {
      return throwError(() => new Error('Match not scheduled'));
    }
    const matchId = match.id!;
    const areAllMatchesFinished = roundMatches.every(
      m => m.status === MatchStatus.FINISHED
    );
    if (areAllMatchesFinished) {
      return throwError(() => new Error('All matches finished for the round'));
    }
    return this.findJokers$(userId, roundMatches).pipe(
      mergeMap(currentJokers => {
        if (currentJokers.length === 0 || currentJokers.length > 1) {
          return this.findOrCreatePredictions$(userId, roundMatches).pipe(
            map(predictions => {
              const currentJoker = predictions.find(p => p.hasJoker === true);
              return currentJoker;
            })
          );
        }
        return of(head(currentJokers));
      }),
      mergeMap(currentJoker => {
        if (!currentJoker) {
          return throwError(
            () => new Error('Could not find or create round joker')
          );
        }
        if (
          currentJoker.match.toString() === matchId &&
          currentJoker.jokerAutoPicked === false
        ) {
          return of([currentJoker]);
        }
        const currentJokerMatch = roundMatches.find(
          m => m.id === currentJoker.id
        );
        if (currentJokerMatch?.status == MatchStatus.FINISHED) {
          return throwError(
            () => new Error('Current joker match already played')
          );
        }

        return this.findOneByUserAndMatch$(userId, matchId).pipe(
          mergeMap(newJoker => {
            const jokers = [];
            if (
              newJoker &&
              currentJoker.match.toString() === newJoker.match.toString()
            ) {
              currentJoker.jokerAutoPicked = false;
              jokers.push(currentJoker);
            } else if (newJoker) {
              currentJoker.hasJoker = false;
              currentJoker.jokerAutoPicked = false;

              newJoker.hasJoker = true;
              newJoker.jokerAutoPicked = false;

              jokers.push(currentJoker, newJoker);
            } else {
              // Rare: Handle the case where newJoker is null
              return throwError(
                () => new Error('Could not find new joker prediction')
              );
            }

            return this.updateMany$(jokers).pipe(
              map(() => ({
                newJokerMatch: newJoker.match,
                oldJokerMatch: currentJoker.match,
              }))
            );
          }),
          mergeMap(({ newJokerMatch, oldJokerMatch }) => {
            return this.findAll$({
              match: { $in: uniq([oldJokerMatch, newJokerMatch]) },
              user: userId,
            });
          })
        );
      })
    );
  }

  pickScore$(
    userId: string,
    match: Match,
    roundMatches: Match[],
    choice: Score
  ): Observable<Prediction | null> {
    if (match.status !== MatchStatus.SCHEDULED) {
      return throwError(() => new Error('Match not scheduled'));
    }
    const matchId = match.id!;
    return this.findOneByUserAndMatch$(userId, matchId).pipe(
      mergeMap(prediction => {
        if (!prediction) {
          return this.findOrCreatePredictions$(userId, roundMatches).pipe(
            map(predictions => {
              const pickPrediction = predictions.find(
                p => p.match.toString() === match.id
              );
              return pickPrediction;
            })
          );
        }
        return of(prediction);
      }),
      mergeMap(prediction => {
        if (!prediction) {
          return throwError(() => new Error('Prediction does not exist'));
        }
        return this.findByIdAndUpdate$(prediction.id!, {
          choice: { ...choice, isComputerGenerated: false },
        });
      })
    );
  }

  repickJokerIfMatch(
    matchId: string,
    roundMatches: Match[]
  ): Observable<number> {
    return this.findJokersByMatch$(matchId).pipe(
      mergeMap(jokers => {
        console.log('jokers length:', jokers.length);
        if (jokers.length === 0) {
          return of(0);
        }
        const scheduledMatches: Match[] = roundMatches.filter(
          m => m.status === MatchStatus.SCHEDULED
        );
        return from(jokers).pipe(
          map(joker => {
            joker.hasJoker = false;
            joker.jokerAutoPicked = false;
            if (scheduledMatches.length === 0) {
              return { newJoker: null, prevJoker: joker };
            }
            const newJokerMatch =
              scheduledMatches[
                Math.floor(Math.random() * scheduledMatches.length)
              ];
            const { id: matchId, season, slug } = newJokerMatch;
            const randomScore = VosePredictorImpl.getDefault().predict();
            const newJokerPred: Prediction = {
              choice: this.getPredictionScore(randomScore),
              hasJoker: true,
              jokerAutoPicked: true,
              match: matchId!,
              matchSlug: slug,
              season,
              user: joker.user,
            };
            const js = {
              newJoker: newJokerPred,
              prevJoker: joker,
            };
            return js;
          }),
          map(({ newJoker, prevJoker }) => {
            return compact([newJoker, prevJoker]);
          }),
          toArray(),
          mergeMap(preds_ => {
            const preds = preds_.flatMap(x => x);
            return this.upsertMany$(preds).pipe(
              map(() => Math.round(preds.length / 2))
            );
          })
        );
      })
    );
  }

  // score is formatted as "homeScore-awayScore"
  private getPredictionScore(score: string, isComputerGenerated = true): Score {
    const teamScores = score.split('-');
    const goalsHomeTeam = Number(teamScores[0]);
    const goalsAwayTeam = Number(teamScores[1]);
    return {
      goalsAwayTeam,
      goalsHomeTeam,
      isComputerGenerated,
    };
  }
}
