import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ScorePoints } from '../../common/score';
import UserScoreModel, {
  UserScore
} from '../models/userScore.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

type Query = {
  leaderboardId: string,
  userId: string,
}

type Metadata = {
  matchId: string,
  predictionId: string,
  hasJoker: boolean,
}
export interface UserScoreRepository extends BaseRepository<UserScore> {
  findScoreAndUpsert$(
    query: Query,
    predictionPoints: ScorePoints,
    rest: Metadata
  ): Observable<UserScore>;

  findByLeaderboardIdOrderByPoints$(
    leaderboardId: string,
  ): Observable<UserScore[]>;
}

export class UserScoreRepositoryImpl
  extends BaseRepositoryImpl<UserScore>
  implements UserScoreRepository {
  public static getInstance() {
    return new UserScoreRepositoryImpl();
  }

  constructor() {
    super(UserScoreModel);
  }

  findScoreAndUpsert$(
    query: Query,
    predictionPoints: ScorePoints,
    rest: Metadata
  ): Observable<UserScore> {
    const { leaderboardId, userId } = query;
    const {
      correctMatchOutcomePoints,
      exactGoalDifferencePoints,
      closeMatchScorePoints,
      exactTeamScorePoints,
      exactMatchScorePoints,
    } = predictionPoints;
    const { matchId, predictionId, hasJoker } = rest;
    const basePoints = correctMatchOutcomePoints + exactGoalDifferencePoints +
      closeMatchScorePoints + exactTeamScorePoints + exactMatchScorePoints;

    let score: UserScore = {
      leaderboard: leaderboardId,
      user: userId,
      correctMatchOutcomePoints,
      exactTeamScorePoints,
      exactMatchScorePoints,
      closeMatchScorePoints,
      exactGoalDifferencePoints,
      basePoints,
      points: basePoints,
    };

    return this.findOne$({ leaderboard: leaderboardId, user: userId }).pipe(
      mergeMap(userScore => {
        if (userScore == null) {
          score.matches = [matchId];
          score.matchesPredicted = 1;
          score.correctMatchOutcomes = correctMatchOutcomePoints / 7;
          score.exactMatchScores = exactMatchScorePoints / 10;
          score.exactGoalDiffs = exactGoalDifferencePoints;
          score.closeMatchScores = Math.ceil(closeMatchScorePoints / 2);

          if (hasJoker) {
            score.points += basePoints;
          }

          return this.insert$(score);
        } else {
          const matches = userScore.matches as string[];
          const matchExists = matches.some(m => m.toString() === matchId);
          if (matchExists) {
            return of(userScore);
          }

          userScore.correctMatchOutcomePoints += correctMatchOutcomePoints;
          userScore.exactGoalDifferencePoints += exactGoalDifferencePoints;
          userScore.closeMatchScorePoints += closeMatchScorePoints;
          userScore.exactTeamScorePoints += exactTeamScorePoints;
          userScore.exactMatchScorePoints += exactMatchScorePoints;

          userScore.basePoints += basePoints;
          userScore.points += hasJoker ? basePoints * 2 : basePoints;

          userScore.correctMatchOutcomes! += (correctMatchOutcomePoints / 7);
          userScore.exactMatchScores! += (exactMatchScorePoints / 10);
          userScore.exactGoalDiffs! += exactGoalDifferencePoints;
          userScore.closeMatchScores! += Math.ceil(closeMatchScorePoints / 2);

          return this.findByIdAndUpdate$(userScore.id!, {
            $set: {
              basePoints: userScore.basePoints,
              points: userScore.points,
              correctMatchOutcomePoints: userScore.correctMatchOutcomePoints,
              exactGoalDifferencePoints: userScore.exactGoalDifferencePoints,
              closeMatchScorePoints: userScore.closeMatchScorePoints,
              exactTeamScorePoints: userScore.exactTeamScorePoints,
              exactMatchScorePoints: userScore.exactMatchScorePoints,
              correctMatchOutcomes: userScore.correctMatchOutcomes,
              exactMatchScores: userScore.exactMatchScores,
              exactGoalDiffs: userScore.exactGoalDiffs,
              closeMatchScores: userScore.closeMatchScores,
            },
            $inc: { matchesPredicted: 1 },
            $push: { matches: matchId, predictions: predictionId },
          });
        }
      })
    );
  }

  public findByLeaderboardIdOrderByPoints$(leaderboardId: string) {
    return this.findAll$({ leaderboard: leaderboardId }, null, {
      sort: {
        points: -1,
        correctMatchOutcomePoints: -1,
        exactMatchScorePoints: -1,
        exactGoalDifferencePoints: -1,
        closeMatchScorePoints: -1,
      },
    });
  }
}
