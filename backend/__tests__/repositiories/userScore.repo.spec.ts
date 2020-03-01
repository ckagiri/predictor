import { flatMap } from 'rxjs/operators';
import { expect } from 'chai';

import * as db from '../../db/index';
import { User } from '../../db/models/user.model';
import {
  Competition,
  CompetitionModel,
} from '../../db/models/competition.model';
import { Season, SeasonModel } from '../../db/models/season.model';
import { Team, TeamModel } from '../../db/models/team.model';
import { Match, MatchModel, MatchStatus } from '../../db/models/match.model';
import { Prediction, PredictionModel } from '../../db/models/prediction.model';
import {
  Leaderboard,
  BOARD_STATUS,
  BOARD_TYPE,
} from '../../db/models/leaderboard.model';
import { UserScoreModel } from '../../db/models/userScore.model';

import { ScorePoints } from '../../common/score';
import { UserScoreRepositoryImpl } from '../../db/repositories/userScore.repo';
import testUtils, { TestUtils } from './testUtils';
let tu: TestUtils = JSON.parse(JSON.stringify(testUtils));

const userScoreRepo = UserScoreRepositoryImpl.getInstance();

describe.only('UserScore Repo', function() {
  this.timeout(5000);
  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
  });

  beforeEach(done => {
    User.create([tu.user1, tu.user2])
      .then(users => {
        tu.user1.id = users[0].id;
        tu.user2.id = users[1].id;
        return Competition.create(tu.league);
      })
      .then(league => {
        let { name, slug, id } = league;
        tu.season.competition = { name, slug, id } as Required<
          CompetitionModel
        >;
        return Season.create(tu.season);
      })
      .then(season => {
        tu.season.id = season.id;
        return Team.create([tu.team1, tu.team2, tu.team3, tu.team4]);
      })
      .then(teams => {
        tu.team1Vteam2.homeTeam = {
          name: teams[0].name,
          slug: teams[0].slug,
          id: teams[0].id,
        } as Required<TeamModel>;

        tu.team1Vteam2.awayTeam = {
          name: teams[1].name,
          slug: teams[1].slug,
          id: teams[1].id,
        } as Required<TeamModel>;

        tu.team1Vteam2.season = tu.season.id;
        tu.team1Vteam2.slug = `${teams[0].slug}-${teams[1].slug}`;

        tu.team3Vteam4.homeTeam = {
          name: teams[2].name,
          slug: teams[2].slug,
          id: teams[2].id,
        } as Required<TeamModel>;

        tu.team3Vteam4.awayTeam = {
          name: teams[3].name,
          slug: teams[3].slug,
          id: teams[3].id,
        } as Required<TeamModel>;

        tu.team3Vteam4.season = tu.season.id;
        tu.team3Vteam4.slug = `${teams[2].slug}-${teams[3].slug}`;

        return Match.create([tu.team1Vteam2, tu.team3Vteam4]);
      })
      .then(matches => {
        tu.team1Vteam2.id = matches[0].id;
        tu.team3Vteam4.id = matches[1].id;

        tu.user1_team1Vteam2 = {
          ...tu.user1_team1Vteam2,
          season: tu.team1Vteam2.season,
          match: tu.team1Vteam2.id,
          matchSlug: tu.team1Vteam2.slug,
          gameRound: tu.team1Vteam2.gameRound,
          user: tu.user1.id,
        };
        tu.user1_team3Vteam4 = {
          ...tu.user1_team3Vteam4,
          season: tu.team3Vteam4.season,
          match: tu.team3Vteam4.id,
          matchSlug: tu.team3Vteam4.slug,
          gameRound: tu.team3Vteam4.gameRound,
          user: tu.user1.id,
        };
        tu.user2_team1Vteam2 = {
          ...tu.user2_team1Vteam2,
          season: tu.team1Vteam2.season,
          match: tu.team1Vteam2.id,
          matchSlug: tu.team1Vteam2.slug,
          gameRound: tu.team1Vteam2.gameRound,
          user: tu.user2.id,
        };
        tu.user2_team3Vteam4 = {
          ...tu.user2_team3Vteam4,
          season: tu.team3Vteam4.season,
          match: tu.team3Vteam4.id,
          matchSlug: tu.team3Vteam4.slug,
          gameRound: tu.team3Vteam4.gameRound,
          user: tu.user2.id,
        };

        return Prediction.create([
          tu.user1_team1Vteam2,
          tu.user1_team3Vteam4,
          tu.user2_team1Vteam2,
          tu.user2_team3Vteam4,
        ]);
      })
      .then(predictions => {
        tu.user1_team1Vteam2.id = predictions[0].id;
        tu.user1_team3Vteam4.id = predictions[1].id;
        tu.user2_team1Vteam2.id = predictions[2].id;
        tu.user2_team3Vteam4.id = predictions[3].id;
        return Leaderboard.create([
          {
            ...tu.season_board,
            season: tu.season.id,
          },
          {
            ...tu.round_board,
            season: tu.season.id,
          },
        ]);
      })
      .then(leaderboards => {
        tu.season_board = leaderboards[0];
        tu.round_board = leaderboards[1];
        done();
      });
  });

  afterEach(done => {
    tu = JSON.parse(JSON.stringify(testUtils));
    db.drop().then(() => {
      done();
    });
  });

  after(done => {
    db.close().then(() => {
      done();
    });
  });

  describe('find and upsert', () => {
    it('should create a userScore if it does not exist', done => {
      const leaderboardId = tu.season_board.id!;
      const userId = tu.user1.id!;
      const matchId = tu.team1Vteam2.id!;
      const predictionId = tu.user1_team1Vteam2.id!;
      const hasJoker = true;
      const predictionPoints = tu.user1_team1Vteam2_points;

      userScoreRepo
        .findOneAndUpsert$(
          leaderboardId,
          userId,
          matchId,
          predictionId,
          predictionPoints,
          hasJoker,
        )
        .subscribe(score => {
          expect(score.pointsExcludingJoker).to.equal(4);
          expect(score.APointsExcludingJoker).to.equal(0);
          expect(score.BPointsExcludingJoker).to.equal(4);
          expect(score.points).to.equal(8);
          expect(score.APoints).to.equal(0);
          expect(score.BPoints).to.equal(8);
          expect(score.matches).to.contain(matchId);
          expect(score.predictions).to.contain(predictionId);
          done();
        });
    });

    it('should update a userScore if it exists', done => {
      const leaderboardId = tu.season_board.id!;
      const userId = tu.user1.id!;
      const matchId = tu.team1Vteam2.id!;
      const predictionId = tu.user1_team1Vteam2.id!;
      const score1 = tu.user1_team1Vteam2_points;
      let joker_score1 = Object.keys(score1).reduce(
        (result, key) => ({ ...result, [key]: score1[key] * 2 }),
        score1,
      );
      const user1_team1Vteam2_score: UserScoreModel = {
        ...joker_score1,
        leaderboard: leaderboardId,
        user: userId,
        matches: [matchId],
        predictions: [predictionId],
        pointsExcludingJoker: score1.points,
        APointsExcludingJoker: score1.APoints,
        BPointsExcludingJoker: score1.BPoints,
      };
      userScoreRepo
        .insert$(user1_team1Vteam2_score)
        .pipe(
          flatMap(_ => {
            const matchId = tu.user1_team3Vteam4.id!;
            const predictionId = tu.user1_team3Vteam4.id!;
            const predictionPoints = tu.user1_team3Vteam4_points;
            const hasJoker = false;
            return userScoreRepo.findOneAndUpsert$(
              leaderboardId,
              userId,
              matchId,
              predictionId,
              predictionPoints,
              hasJoker,
            );
          }),
        )
        .subscribe(score => {
          const match1 = tu.team1Vteam2.id!;
          const match2 = tu.team3Vteam4.id!;
          const pred1 = tu.user1_team1Vteam2.id!;
          const pred2 = tu.user1_team3Vteam4.id!;
          expect(score.pointsExcludingJoker).to.equal(13);
          expect(score.APointsExcludingJoker).to.equal(5);
          expect(score.BPointsExcludingJoker).to.equal(8);
          expect(score.points).to.equal(17);
          expect(score.APoints).to.equal(5);
          expect(score.BPoints).to.equal(12);
          expect(score.matches).to.contain(match1, match2);
          expect(score.predictions).to.contain(pred1, pred2);
          done();
        });
    });
  });

  it('should find by leaderboard and order by points', done => {
    const leaderboardId = tu.season_board.id!;
    const user1Id = tu.user1.id!;
    const matchId = tu.team1Vteam2.id!;
    const user1_predictionId = tu.user1_team1Vteam2.id!;
    const user1_match1_points = tu.user1_team1Vteam2_points;
    const user1_match1_joker_points = Object.keys(user1_match1_points).reduce(
      (result, key) => ({ ...result, [key]: user1_match1_points[key] * 2 }),
      user1_match1_points,
    );
    const user1_match1_score: UserScoreModel = {
      ...user1_match1_joker_points,
      leaderboard: leaderboardId,
      user: user1Id,
      matches: [matchId],
      predictions: [user1_predictionId],
      pointsExcludingJoker: user1_match1_points.points,
      APointsExcludingJoker: user1_match1_points.APoints,
      BPointsExcludingJoker: user1_match1_points.BPoints,
    };

    const user2Id = tu.user2.id!;
    const user2_predictionId = tu.user2_team1Vteam2.id!;
    const user2_match1_points = tu.user2_team1Vteam2_points;
    const user2_match1_score: UserScoreModel = {
      ...user2_match1_points,
      leaderboard: leaderboardId,
      user: user2Id,
      matches: [matchId],
      predictions: [user2_predictionId],
      pointsExcludingJoker: user2_match1_points.points,
      APointsExcludingJoker: user2_match1_points.APoints,
      BPointsExcludingJoker: user2_match1_points.BPoints,
    };

    userScoreRepo
      .insertMany$([user2_match1_score, user1_match1_score])
      .pipe(
        flatMap(_ => {
          return userScoreRepo.findByLeaderboardOrderByPoints$(leaderboardId);
        }),
      )
      .subscribe(standings => {
        expect(standings[1].points).to.be.lte(standings[0].points);
        done();
      });
  });

  it('should find by id and update positions', done => {
    const leaderboardId = tu.season_board.id!;
    const userId = tu.user1.id!;
    const matchId = tu.team1Vteam2.id!;
    const predictionId = tu.user1_team1Vteam2.id!;
    const score1 = tu.user1_team1Vteam2_points;
    const user1_match1_score: UserScoreModel = {
      ...score1,
      leaderboard: leaderboardId,
      user: userId,
      matches: [matchId],
      predictions: [predictionId],
      pointsExcludingJoker: score1.points,
      APointsExcludingJoker: score1.APoints,
      BPointsExcludingJoker: score1.BPoints,
      positionNew: 1,
      positionOld: 2,
    };
    userScoreRepo
      .insert$(user1_match1_score)
      .pipe(
        flatMap(standing => {
          const prevPosition = standing.positionNew!;
          const positionOld = prevPosition;
          const positionNew = prevPosition + 1;
          return userScoreRepo.findByIdAndUpdate$(standing.id!, {
            positionNew,
            positionOld,
          });
        }),
      )
      .subscribe(standing => {
        expect(standing.positionNew).to.equal(2);
        expect(standing.positionOld).to.equal(1);
        done();
      });
  });
});
