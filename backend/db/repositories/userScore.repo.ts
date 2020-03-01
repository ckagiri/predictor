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
      ExactGoalDifferencePoints,
      ExactMatchScorePoints,
      CloseMatchScorePoints,
      SpreadTeamScorePoints,
      ExactTeamScorePoints,
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
      CloseMatchScorePoints,
      SpreadTeamScorePoints,
      ExactGoalDifferencePoints,
    };

    return this.findOne$({ leaderboard: leaderboardId, user: userId }).pipe(
      flatMap(standing => {
        if (standing === null) {
          score.matches = [matchId];
          score.predictions = [predictionId];
          score.pointsExcludingJoker = points;
          score.APointsExcludingJoker = APoints;
          score.BPointsExcludingJoker = BPoints;
          if (hasJoker) {
            score.points *= 2;
            score.APoints *= 2;
            score.BPoints *= 2;
            score.CorrectMatchOutcomePoints *= 2;
            score.ExactGoalDifferencePoints *= 2;
            score.ExactMatchScorePoints *= 2;
            score.CloseMatchScorePoints *= 2;
            score.SpreadTeamScorePoints *= 2;
            score.ExactTeamScorePoints *= 2;
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

          standing.CorrectMatchOutcomePoints += hasJoker
            ? CorrectMatchOutcomePoints * 2
            : CorrectMatchOutcomePoints;
          standing.ExactGoalDifferencePoints += hasJoker
            ? ExactGoalDifferencePoints * 2
            : ExactGoalDifferencePoints;
          standing.ExactMatchScorePoints += hasJoker
            ? ExactMatchScorePoints * 2
            : ExactMatchScorePoints;
          standing.ExactMatchScorePoints += hasJoker
            ? ExactMatchScorePoints * 2
            : ExactMatchScorePoints;
          standing.SpreadTeamScorePoints += hasJoker
            ? SpreadTeamScorePoints * 2
            : SpreadTeamScorePoints;
          standing.ExactTeamScorePoints += hasJoker
            ? SpreadTeamScorePoints * 2
            : ExactTeamScorePoints;
          standing.APoints += hasJoker ? APoints * 2 : APoints;
          standing.BPoints += hasJoker ? BPoints * 2 : BPoints;
          standing.points += hasJoker ? points * 2 : points;

          return this.findByIdAndUpdate$(standing.id!, {
            $set: {
              points: standing.points,
              APoints: standing.APoints,
              BPoints: standing.BPoints,
              CorrectMatchOutcomePoints: standing.CorrectMatchOutcomePoints,
              ExactGoalDifferencePoints: standing.ExactGoalDifferencePoints,
              ExactMatchScorePoints: standing.ExactMatchScorePoints,
              ExactTeamScorePoints: standing.ExactTeamScorePoints,
              SpreadTeamScorePoints: standing.SpreadTeamScorePoints,
              CloseMatchScorePoints: standing.CloseMatchScorePoints,
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
        ExactGoalDifferencePoints: -1,
        ExactMatchScorePoints: -1,
        CloseMatchScorePoints: -1,
        SpreadTeamScorePoints: -1,
        ExactTeamScorePoints: -1,
      },
    });
  }
}
