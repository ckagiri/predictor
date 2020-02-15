import { flatMap } from 'rxjs/operators';
import { expect } from 'chai';

import * as db from '../../db/index';
import { config } from '../../config/environment/index';

import { User } from '../../db/models/user.model';
import { League, ILeague } from '../../db/models/league.model';
import { Season, ISeason } from '../../db/models/season.model';
import { Team, ITeam } from '../../db/models/team.model';
import { Fixture, IFixture, FixtureStatus } from '../../db/models/fixture.model';
import { Prediction, IPrediction } from '../../db/models/prediction.model';
import { Leaderboard, BOARD_STATUS, BOARD_TYPE } from '../../db/models/leaderboard.model';
import { IUserScore } from '../../db/models/userScore.model';

import { ScorePoints } from '../../common/score';
import { UserScoreRepository } from '../../db/repositories/userScore.repo';

const userScoreRepo = UserScoreRepository.getInstance();
let user1: any;
let user2: any;
let theSeason: any;
let team1: any;
let team2: any;
let team3: any;
let team4: any;
let fixture1: any;
let fixture2: any;
let user1Pred1: any;
let user1Pred2: any;
let user2Pred1: any;
let sBoard: any;

const epl: ILeague = {
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'epl'
};

const epl18: ISeason = {
  name: '2018-2019',
  slug: '2018-19',
  year: 2018,
  seasonStart: '2017-08-11T00:00:00+0200',
  seasonEnd: '2018-05-13T16:00:00+0200',
  currentMatchRound: 20,
  currentGameRound: 20,
  league: undefined
};

const manu: ITeam = {
  name: 'Manchester United FC',
  shortName: 'Man United',
  code: 'MUN',
  slug: 'man_united',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
  aliases: ['ManU', 'ManUtd']
};

const manc: ITeam = {
  name: 'Manchester City FC',
  shortName: 'Man City',
  code: 'MCI',
  slug: 'man_city',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_City_FC.svg',
  aliases: ['ManCity']
};

const che: ITeam = {
  name: 'Chelsea FC',
  shortName: 'Chelsea',
  code: 'CHE',
  slug: 'chelsea',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Chelsea_FC.svg',
  aliases: ['Chelsea']
};

const ars: ITeam = {
  name: 'Arsenal FC',
  shortName: 'Arsenal',
  code: 'ARS',
  slug: 'arsenal',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Arsenal_FC.svg',
  aliases: ['Arsenal']
};

const manuVmanc: IFixture = {
  date: '2017-09-10T11:30:00Z',
  status: FixtureStatus.SCHEDULED,
  matchRound: 20,
  gameRound: 20,
  season: undefined,
  homeTeam: undefined,
  awayTeam: undefined,
  slug: 'manu-v-manc',
  result: undefined
};

const cheVars: IFixture = {
  date: '2017-09-10T11:30:00Z',
  status: FixtureStatus.SCHEDULED,
  matchRound: 20,
  gameRound: 20,
  season: undefined,
  homeTeam: undefined,
  awayTeam: undefined,
  slug: 'che-v-ars',
  result: undefined
};

const chalo = {
  username: 'chalo',
  email: 'chalo@example.com'
};

const kagiri = {
  username: 'kagiri',
  email: 'kagiri@example.com'
};

describe('UserScore Repo', function () {
  this.timeout(5000);
  before(done => {
    db.init(config.testDb.uri, done, { drop: true });
  });

  beforeEach(done => {
    User.create([chalo, kagiri])
      .then(users => {
        user1 = users[0];
        user2 = users[1];
        return League.create(epl);
      })
      .then(l => {
        const { name, slug, id } = l;
        epl18.league = { name, slug, id: id! };
        return Season.create(epl18);
      })
      .then(s => {
        theSeason = s;
        return Team.create([manu, manc, che, ars]);
      })
      .then(teams => {
        team1 = teams[0];
        team2 = teams[1];
        team3 = teams[2];
        team4 = teams[3];
        manuVmanc.season = theSeason._id;
        cheVars.season = theSeason._id;
        manuVmanc.homeTeam = {
          name: team1.name,
          slug: team1.slug,
          id: team1._id,
          crestUrl: team1.crestUrl
        };
        manuVmanc.awayTeam = {
          name: team2.name,
          slug: team2.slug,
          id: team2._id,
          crestUrl: team2.crestUrl
        };
        manuVmanc.slug = `${team1.slug}-${team2.slug}`;
        cheVars.homeTeam = {
          name: team3.name,
          slug: team3.slug,
          id: team3._id,
          crestUrl: team3.crestUrl
        };
        cheVars.awayTeam = {
          name: team4.name,
          slug: team4.slug,
          id: team4._id,
          crestUrl: team4.crestUrl
        };
        cheVars.slug = `${team3.slug}-${team4.slug}`;
        return Fixture.create([manuVmanc, cheVars]);
      })
      .then(fixtures => {
        fixture1 = fixtures[0];
        fixture2 = fixtures[1];
        const pred1: IPrediction = {
          user: user1.id,
          fixture: fixture1.id,
          fixtureSlug: fixture1.slug,
          season: theSeason.id,
          gameRound: fixture1.gameRound,
          choice: {
            goalsHomeTeam: 1,
            goalsAwayTeam: 0,
            isComputerGenerated: true
          }
        };
        const pred2: IPrediction = {
          user: user1.id,
          fixture: fixture2.id,
          fixtureSlug: fixture2.slug,
          season: theSeason.id,
          gameRound: fixture2.gameRound,
          choice: {
            goalsHomeTeam: 2,
            goalsAwayTeam: 0,
            isComputerGenerated: true
          }
        };
        const pred3: IPrediction = {
          user: user2.id,
          fixture: fixture1.id,
          fixtureSlug: fixture1.slug,
          season: theSeason.id,
          gameRound: fixture1.gameRound,
          choice: {
            goalsHomeTeam: 3,
            goalsAwayTeam: 0,
            isComputerGenerated: true
          }
        };
        return Prediction.create([pred1, pred2, pred3]);
      })
      .then(predictions => {
        user1Pred1 = predictions[0];
        user1Pred2 = predictions[1];
        user2Pred1 = predictions[2];
        return Leaderboard.create([
          {
            status: BOARD_STATUS.UPDATING_SCORES,
            boardType: BOARD_TYPE.GLOBAL_SEASON,
            season: theSeason.id
          },
          {
            status: BOARD_STATUS.REFRESHED,
            boardType: BOARD_TYPE.GLOBAL_ROUND,
            season: theSeason.id,
            gameRound: 20
          }
        ]);
      })
      .then(leaderboards => {
        sBoard = leaderboards[0];
        done();
      });
  });

  afterEach(done => {
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
      const leaderboardId = sBoard.id;
      const userId = user1.id;
      const fixtureId = fixture1.id;
      const predictionId = user1Pred1.id;
      const predictionPoints: ScorePoints = {
        points: 7,
        APoints: 7,
        BPoints: 0,
        MatchOutcomePoints: 4,
        TeamScorePlusPoints: 3,
        GoalDifferencePoints: 0,
        ExactScorePoints: 0,
        TeamScoreMinusPoints: 0
      };
      const hasJoker = true;
      userScoreRepo
        .findOneAndUpsert$(
          leaderboardId,
          userId,
          fixtureId,
          predictionId,
          predictionPoints,
          hasJoker
        )
        .subscribe(score => {
          expect(score.pointsExcludingJoker).to.equal(7);
          expect(score.APointsExcludingJoker).to.equal(7);
          expect(score.BPointsExcludingJoker).to.equal(0);
          expect(score.points).to.equal(14);
          expect(score.APoints).to.equal(14);
          expect(score.BPoints).to.equal(0);
          expect(score.fixtures).to.contain(fixture1.id);
          expect(score.predictions).to.contain(user1Pred1.id);
          done();
        });
    });

    it('should update a userScore if it exists', done => {
      const leaderboardId = sBoard.id;
      const userId = user1.id;
      let fixtureId = fixture1.id;
      let predictionId = user1Pred1.id;
      const score1: IUserScore = {
        leaderboard: leaderboardId,
        user: userId,
        points: 14,
        APoints: 14,
        BPoints: 0,
        MatchOutcomePoints: 8,
        TeamScorePlusPoints: 6,
        ExactScorePoints: 0,
        GoalDifferencePoints: 0,
        TeamScoreMinusPoints: 0,
        fixtures: [fixtureId],
        predictions: [predictionId],
        pointsExcludingJoker: 7,
        APointsExcludingJoker: 7,
        BPointsExcludingJoker: 0
      };
      userScoreRepo
        .insert$(score1)
        .pipe(
          flatMap(_ => {
            const predictionPoints: ScorePoints = {
              points: 10,
              APoints: 8,
              BPoints: 2,
              MatchOutcomePoints: 4,
              TeamScorePlusPoints: 4,
              GoalDifferencePoints: 1,
              ExactScorePoints: 1,
              TeamScoreMinusPoints: 0
            };
            const hasJoker = false;
            fixtureId = fixture2.id;
            predictionId = user1Pred2.id;
            return userScoreRepo.findOneAndUpsert$(
              leaderboardId,
              userId,
              fixtureId,
              predictionId,
              predictionPoints,
              hasJoker
            );
          })
        )
        .subscribe(score => {
          expect(score.pointsExcludingJoker).to.equal(17);
          expect(score.APointsExcludingJoker).to.equal(15);
          expect(score.BPointsExcludingJoker).to.equal(2);
          expect(score.points).to.equal(24);
          expect(score.APoints).to.equal(22);
          expect(score.BPoints).to.equal(2);
          expect(score.fixtures).to.contain(fixture1.id, fixture2.id);
          expect(score.predictions).to.contain(user1Pred1.id, user1Pred2.id);
          done();
        });
    });
  });

  it('should find by leaderboard and order by points', done => {
    const leaderboardId = sBoard.id;
    const fixtureId = fixture1.id;
    const score1: IUserScore = {
      leaderboard: leaderboardId,
      user: user1.id,
      points: 14,
      APoints: 14,
      BPoints: 0,
      MatchOutcomePoints: 8,
      TeamScorePlusPoints: 6,
      ExactScorePoints: 0,
      GoalDifferencePoints: 0,
      TeamScoreMinusPoints: 0,
      fixtures: [fixtureId],
      predictions: [user1Pred1.id],
      pointsExcludingJoker: 7,
      APointsExcludingJoker: 7,
      BPointsExcludingJoker: 0
    };
    const score2: IUserScore = {
      leaderboard: leaderboardId,
      user: user2.id,
      points: 10,
      APoints: 8,
      BPoints: 2,
      MatchOutcomePoints: 4,
      TeamScorePlusPoints: 4,
      ExactScorePoints: 1,
      GoalDifferencePoints: 1,
      TeamScoreMinusPoints: 0,
      fixtures: [fixtureId],
      predictions: [user2Pred1.id],
      pointsExcludingJoker: 7,
      APointsExcludingJoker: 7,
      BPointsExcludingJoker: 0
    };
    userScoreRepo
      .insertMany$([score2, score1])
      .pipe(
        flatMap(_ => {
          return userScoreRepo.findByLeaderboardOrderByPoints$(sBoard.id);
        })
      )
      .subscribe(standings => {
        expect(standings[0].points).to.be.at.least(standings[1].points);
        done();
      });
  });

  it('should find by id and update positions', done => {
    const leaderboardId = sBoard.id;
    const userId = user1.id;
    const fixtureId = fixture1.id;
    const predictionId = user1Pred1.id;
    const score1: IUserScore = {
      leaderboard: leaderboardId,
      user: userId,
      points: 14,
      APoints: 14,
      BPoints: 0,
      MatchOutcomePoints: 8,
      TeamScorePlusPoints: 6,
      ExactScorePoints: 0,
      GoalDifferencePoints: 0,
      TeamScoreMinusPoints: 0,
      fixtures: [fixtureId],
      predictions: [predictionId],
      pointsExcludingJoker: 7,
      APointsExcludingJoker: 7,
      BPointsExcludingJoker: 0,
      positionNew: 1,
      positionOld: 2
    };
    userScoreRepo
      .insert$(score1)
      .pipe(
        flatMap(standing => {
          const prevPosition = standing.positionNew!;
          const positionOld = prevPosition;
          const positionNew = prevPosition + 1;
          return userScoreRepo.findByIdAndUpdate$(standing.id!, {
            positionNew,
            positionOld
          });
        })
      )
      .subscribe(standing => {
        expect(standing.positionNew).to.equal(2);
        expect(standing.positionOld).to.equal(1);
        done();
      });
  });
});
