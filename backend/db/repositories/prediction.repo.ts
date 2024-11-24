import { Observable, of, from, throwError, iif } from 'rxjs';
import { filter, mergeMap, map, toArray } from 'rxjs/operators';

import PredictionModel, { Prediction } from '../models/prediction.model';
import { Match, MatchStatus } from '../models/match.model';
import { Score } from '../../common/score';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';
import { head, isEmpty, uniq } from 'lodash';
import { VosePredictor } from '../helpers/vose-predictor'

export interface PredictionRepository extends BaseRepository<Prediction> {
  findOne$(userId: string, matchId: string, projection?: any): Observable<Prediction>;
  findOrCreatePredictions$(userId: string, roundMatches: Match[], withJoker?: boolean): Observable<Prediction[]>
  findOrCreatePicks$(userId: string, roundMatches: Match[], withJoker?: boolean): Observable<Prediction[]>;
  pickScore$(userId: string, match: Match, roundMatches: Match[], choice: Score): Observable<Prediction>;
  pickJoker$(userId: string, match: Match, roundMatches: Match[]): Observable<Prediction[]>;
}

export class PredictionRepositoryImpl
  extends BaseRepositoryImpl<Prediction>
  implements PredictionRepository {
  public static getInstance() {
    return new PredictionRepositoryImpl();
  }

  readonly defaultVosePredictor: VosePredictor;

  constructor() {
    super(PredictionModel);
    this.defaultVosePredictor = new VosePredictor();
  }

  pickScore$(userId: string, match: Match, roundMatches: Match[], choice: Score): Observable<Prediction> {
    if (match.status !== MatchStatus.SCHEDULED) {
      return throwError(() => new Error('Match not scheduled'))
    }
    const matchId = match.id!;
    return this.findOne$(userId, matchId)
      .pipe(
        mergeMap(prediction => {
          if (!prediction) {
            return this.findOrCreatePredictions$(userId, roundMatches)
              .pipe(
                map(predictions => {
                  const pickPrediction = predictions.find(p => p.match.toString() === match.id);
                  return pickPrediction
                })
              )
          }
          return of(prediction)
        }),
        mergeMap(prediction => {
          if (!prediction) {
            return throwError(() => new Error('Prediction does not exist'));
          }
          return this.findByIdAndUpdate$(prediction?.id!, { choice: { ...choice, isComputerGenerated: false } })
        })
      )
  }

  pickJoker$(userId: string, match: Match, roundMatches: Match[]): Observable<Prediction[]> {
    if (match.status !== MatchStatus.SCHEDULED) {
      return throwError(() => new Error('Match not scheduled'))
    }
    const matchId = match.id!;
    const areAllMatchesFinished = roundMatches.every(m => m.status === MatchStatus.FINISHED);
    if (areAllMatchesFinished) {
      return throwError(() => new Error('All matches finished for the round'))
    }
    return this.findJokers$(userId, roundMatches)
      .pipe(
        mergeMap(currentJokers => {
          if (isEmpty(currentJokers) || currentJokers.length > 1) {
            return this.findOrCreatePredictions$(userId, roundMatches)
              .pipe(
                map(predictions => {
                  const currentJoker = predictions.find(p => p.hasJoker === true);
                  return currentJoker
                })
              )
          }
          return of(head(currentJokers))
        }),
        mergeMap(currentJoker => {
          if (!currentJoker) {
            return throwError(() => new Error('Could not find or create round joker'))
          }
          if (currentJoker.match.toString() === matchId && currentJoker.jokerAutoPicked === false) {
            return of([currentJoker])
          }
          const currentJokerMatch = roundMatches.find(m => m.id === currentJoker.id);
          if (currentJokerMatch?.status == MatchStatus.FINISHED) {
            return throwError(() => new Error('Current joker match already played'))
          }

          return this.findOne$(userId, matchId)
            .pipe(
              mergeMap(newJoker => {
                const jokers = [];
                if (currentJoker.match.toString() === newJoker.match.toString()) {
                  currentJoker.jokerAutoPicked = false;
                  jokers.push(currentJoker);
                } else {
                  currentJoker.hasJoker = false;
                  currentJoker.jokerAutoPicked = false;

                  newJoker.hasJoker = true;
                  newJoker.jokerAutoPicked = false;

                  jokers.push(currentJoker, newJoker);
                }

                return this.updateMany$(jokers)
                  .pipe(
                    map(() => ({
                      oldJokerMatch: currentJoker.match,
                      newJokerMatch: newJoker.match,
                    }))
                  )
              }),
              mergeMap(({ oldJokerMatch, newJokerMatch }) => {
                return this.findAll$({
                  user: userId,
                  match: { $in: uniq([oldJokerMatch, newJokerMatch]) }
                })
              })
            )
        })
      )
  }

  findOrCreatePredictions$(userId: string, roundMatches: Match[], withJoker = true): Observable<Prediction[]> {
    return iif(
      () => withJoker, this.findOrCreateJoker$(userId, roundMatches), of(undefined)
    ).pipe(
      mergeMap(() => {
        return this.findAll$({
          user: userId,
          match: { $in: roundMatches.map(n => n.id) },
        })
      }),
      mergeMap(predictions => {
        const scheduledMatches: Match[] = roundMatches.filter(m => m.status === MatchStatus.SCHEDULED);
        const predictionMatchIds: string[] = predictions.map(p => p.match.toString());
        const newPredictionMatches = scheduledMatches.filter(m => !predictionMatchIds.includes(m.id!));
        if (isEmpty(newPredictionMatches)) {
          return of(predictions);
        }

        const newPredictions = newPredictionMatches.map(match => {
          const { id: matchId, slug: matchSlug, season } = match;
          const score = this.defaultVosePredictor.predict()
          const prediction: Prediction = {
            user: userId,
            season,
            match: matchId!,
            matchSlug,
            choice: this.getPredictionScore(score),
          };
          return prediction
        });
        return this.insertMany$(newPredictions)
          .pipe(
            mergeMap(() => {
              return this.findAll$({
                user: userId,
                match: { $in: roundMatches.map(m => m.id) },
              })
            })
          )
      })
    )
  }

  findOrCreatePicks$(userId: string, roundMatches: Match[], withJoker = true): Observable<Prediction[]> {
    return this.findOrCreatePredictions$(userId, roundMatches, withJoker)
      .pipe(
        mergeMap(predictions => {
          return from(predictions)
            .pipe(
              filter(prediction => {
                return Boolean(prediction.choice.isComputerGenerated);
              }),
              map(prediction => {
                const predictionMatch = roundMatches.find(m => m.id === prediction.match.toString());
                const randomScore = new VosePredictor(predictionMatch?.odds).predict()
                const isComputerGenerated = false;
                prediction.choice = this.getPredictionScore(randomScore, isComputerGenerated);
                if (!!prediction.hasJoker) {
                  prediction.jokerAutoPicked = false;
                }
                return prediction;
              }),
              toArray(),
            )
        }),
        mergeMap(newPicks => {
          return iif(
            () => Boolean(newPicks.length),
            this.updateMany$(newPicks),
            of(undefined))
        }),
        mergeMap(() => {
          return this.findAll$({
            user: userId,
            match: { $in: roundMatches.map(m => m.id) },
            'choice.isComputerGenerated': false
          })
        })
      )
  }

  findJokers$(userId: string, roundMatches: Match[]): Observable<Prediction[]> {
    return super.findAll$({
      user: userId,
      match: { $in: roundMatches.map(m => m.id) },
      hasJoker: true
    })
  }

  findOrCreateJoker$(userId: string, roundMatches: Match[]): Observable<Prediction | undefined> {
    const matchIds = roundMatches.map(m => m.id)
    return this.findAll$({
      user: userId,
      match: { $in: matchIds },
      hasJoker: true
    })
      .pipe(
        mergeMap(jokerPredictions => {
          const jokers = [];
          if (jokerPredictions.length === 0) {
            const selectableMatchIds = roundMatches
              .filter(m => m.status === MatchStatus.SCHEDULED)
              .map(m => m.id);
            if (selectableMatchIds.length) {
              const jokerMatchId = selectableMatchIds[Math.floor(Math.random() * selectableMatchIds.length)]!;
              const jokerMatch = roundMatches.find(m => m.id === jokerMatchId) as Match;

              const { season, slug: jokerMatchSlug } = jokerMatch;
              const randomScore = this.defaultVosePredictor.predict()
              const joker: Prediction = {
                user: userId,
                season,
                match: jokerMatchId,
                matchSlug: jokerMatchSlug,
                hasJoker: true,
                jokerAutoPicked: true,
                choice: this.getPredictionScore(randomScore),
              };
              jokers.push(joker);
            }
          } else if (jokerPredictions.length > 1) { // Precautionary
            const getTime = (date?: string | number | Date): number => date != null ? new Date(date).getTime() : 0;
            const [, ...otherJokers] = jokerPredictions.sort((a: Prediction, b) => {
              return getTime(b.createdAt) - getTime(a.createdAt);
            })
            otherJokers.forEach(j => {
              j.hasJoker = false;
              j.jokerAutoPicked = false;
              jokers.push(j);
            });
          }

          if (jokers.length) {
            return this.upsertMany$(jokers);
          } else {
            return of(head(jokerPredictions));
          }
        }),
        mergeMap(result => {
          if (result?.constructor && result.constructor.name === 'BulkWriteResult') {
            return super.findOne$({
              user: userId,
              match: { $in: matchIds },
              hasJoker: true
            })
          }
          return of(result as Prediction)
        })
      )
  }

  public findOne$(userId: string, matchId: string, projection?: any): Observable<Prediction> {
    return super.findOne$({ user: userId, match: matchId }, projection);
  }

  // score is formatted as "homeScore-awayScore"
  private getPredictionScore(score: string, isComputerGenerated = true): Score {
    const teamScores = score.split('-')
    const goalsHomeTeam = Number(teamScores[0]);
    const goalsAwayTeam = Number(teamScores[1]);
    return {
      goalsHomeTeam,
      goalsAwayTeam,
      isComputerGenerated,
    };
  }
}
