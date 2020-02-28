import { Observable, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { ScorePoints } from '../../common/score';
import {
  UserScoreModel,
  UserScoreDocument,
  UserScore,
} from '../models/userScore.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface UserScoreRepository extends BaseRepository<UserScoreModel> {
  findOneAndUpsert$(
    leaderboardId: string,
    userId: string,
    matchId: string,
    predictionId: string,
    predictionPoints: ScorePoints,
    hasJoker: boolean,
  ): Observable<UserScoreModel>;
  findByLeaderboardOrderByPoints$(
    leaderboardId: string,
  ): Observable<UserScoreModel[]>;
}

export class UserScoreRepositoryImpl
  extends BaseRepositoryImpl<UserScoreModel, UserScoreDocument>
  implements UserScoreRepository {
  public static getInstance() {
    return new UserScoreRepositoryImpl();
  }

  constructor() {
    super(UserScore);
  }

  public findOneAndUpsert$(
    leaderboardId: string,
    userId: string,
    matchId: string,
    predictionId: string,
    predictionPoints: ScorePoints,
    hasJoker: boolean,
  ) {
    const {
      points,
      APoints,
      BPoints,
      CorrectMatchOutcomePoints,
      ExactTeamScorePoints,
      ExactMatchScorePoints,
      ExactGoalDifferencePoints,
      SpreadTeamScorePoints,
    } = predictionPoints;

    const score: UserScoreModel = {
      leaderboard: leaderboardId,
      user: userId,
      points,
      APoints,
      BPoints,
      CorrectMatchOutcomePoints,
      ExactTeamScorePoints,
      ExactMatchScorePoints,
      ExactGoalDifferencePoints,
      SpreadTeamScorePoints,
    };

    return this.findOne$({ leaderboard: leaderboardId, user: userId }).pipe(
      flatMap(standing => {
        if (standing === null) {
          score.matches = [matchId];
          score.predictions = [predictionId];
          score.pointsExcludingJoker = points;
          score.APointsExcludingJoker = APoints;
          score.BPointsExcludingJoker = BPoints;
          if (hasJoker && points > 0) {
            score.points *= 2;
            score.APoints *= 2;
            score.BPoints *= 2;
            score.CorrectMatchOutcomePoints *= 2;
            score.ExactTeamScorePoints *= 2;
            score.ExactMatchScorePoints *= 2;
            score.ExactGoalDifferencePoints *= 2;
            score.SpreadTeamScorePoints *= 2;
          }
          return this.insert$(score);
        } else {
          const matches = standing.matches as string[];
          const matchExists = matches.some(n => n.toString() === matchId);
          if (matchExists) {
            return of(standing);
          }

          standing.pointsExcludingJoker! += points;
          standing.APointsExcludingJoker! += APoints;
          standing.BPointsExcludingJoker! += BPoints;

          const shouldDouble = hasJoker && points > 0;
          standing.CorrectMatchOutcomePoints += shouldDouble
            ? CorrectMatchOutcomePoints * 2
            : CorrectMatchOutcomePoints;
          standing.ExactTeamScorePoints += shouldDouble
            ? SpreadTeamScorePoints * 2
            : ExactTeamScorePoints;
          standing.ExactMatchScorePoints += shouldDouble
            ? ExactMatchScorePoints * 2
            : ExactMatchScorePoints;
          standing.ExactGoalDifferencePoints += shouldDouble
            ? ExactGoalDifferencePoints * 2
            : ExactGoalDifferencePoints;
          standing.SpreadTeamScorePoints += shouldDouble
            ? SpreadTeamScorePoints * 2
            : SpreadTeamScorePoints;
          standing.APoints += shouldDouble ? APoints * 2 : APoints;
          standing.BPoints += shouldDouble ? BPoints * 2 : BPoints;
          standing.points += shouldDouble ? points * 2 : points;

          return this.findByIdAndUpdate$(standing.id!, {
            $set: {
              points: standing.points,
              APoints: standing.APoints,
              BPoints: standing.BPoints,
              CorrectMatchOutcomePoints: standing.CorrectMatchOutcomePoints,
              ExactTeamScorePoints: standing.ExactTeamScorePoints,
              ExactMatchScorePoints: standing.ExactMatchScorePoints,
              ExactGoalDifferencePoints: standing.ExactGoalDifferencePoints,
              SpreadTeamScorePoints: standing.SpreadTeamScorePoints,
              pointsExcludingJoker: standing.pointsExcludingJoker,
              APointsExcludingJoker: standing.APointsExcludingJoker,
              BPointsExcludingJoker: standing.BPointsExcludingJoker,
            },
            $push: { matches: matchId, predictions: predictionId },
          });
        }
      }),
    );
  }

  public findByLeaderboardOrderByPoints$(leaderboardId: string) {
    return this.findAll$({ leaderboard: leaderboardId }, null, {
      sort: {
        points: -1,
        APoints: -1,
        BPoints: -1,
        CorrectMatchOutcomePoints: -1,
        ExactTeamScorePoints: -1,
        ExactMatchScorePoints: -1,
        ExactGoalDifferencePoints: -1,
      },
    });
  }
}
