import { Competition, Team } from '../../db/models';
import { MatchStatus } from '../../db/models/match.model';
import db from '../../db';
import { LeaderboardUpdaterImpl } from '../../app/schedulers/leaderboard.updater';
import testUtils, { TestUtils } from './testUtils';
import { CacheServiceImpl } from '../../common/observableCacheService';

const leaderboardUpdater = LeaderboardUpdaterImpl.getInstance().setCacheService(
  new CacheServiceImpl(),
);

let tu: TestUtils = JSON.parse(JSON.stringify(testUtils));

describe('Finished Matches Processor', function() {
  this.timeout(9999);

  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
  });

  beforeEach(done => {
    db.Competition.create(tu.league)
      .then(league => {
        let { name, slug, id } = league;
        tu.season.competition = { name, slug, id } as Required<Competition>;
        return db.Season.create(tu.season);
      })
      .then(season => {
        tu.team1Vteam2.season = season.id;
        tu.team3Vteam4.season = season.id;
        return db.Team.create([tu.team1, tu.team2, tu.team3, tu.team4]);
      })
      .then(teams => {
        tu.team1Vteam2.homeTeam = {
          name: teams[0].name,
          slug: teams[0].slug,
          id: teams[0].id,
        } as Required<Team>;

        tu.team1Vteam2.awayTeam = {
          name: teams[1].name,
          slug: teams[1].slug,
          id: teams[1].id,
        } as Required<Team>;

        tu.team1Vteam2.slug = `${teams[0].slug}-${teams[1].slug}`;
        tu.team1Vteam2.status = MatchStatus.FINISHED;
        tu.team1Vteam2.date = new Date('2019-04-09T00:00:00+0200');
        tu.team1Vteam2.result = {
          goalsHomeTeam: 0,
          goalsAwayTeam: 0,
        };

        tu.team3Vteam4.homeTeam = {
          name: teams[2].name,
          slug: teams[2].slug,
          id: teams[2].id,
        } as Required<Team>;

        tu.team3Vteam4.awayTeam = {
          name: teams[3].name,
          slug: teams[3].slug,
          id: teams[3].id,
        } as Required<Team>;

        tu.team3Vteam4.slug = `${teams[2].slug}-${teams[3].slug}`;
        tu.team3Vteam4.status = MatchStatus.FINISHED;
        tu.team3Vteam4.date = new Date('2019-04-13T00:00:00+0200');
        tu.team3Vteam4.result = {
          goalsHomeTeam: 2,
          goalsAwayTeam: 0,
        };

        return db.Match.create([tu.team1Vteam2, tu.team3Vteam4]);
      })
      .then(matches => {
        tu.team1Vteam2.id = matches[0].id;
        tu.team3Vteam4.id = matches[1].id;

        return db.User.create([tu.user1, tu.user2]);
      })
      .then(users => {
        tu.user1_team1Vteam2 = {
          ...tu.user1_team1Vteam2,
          season: tu.team1Vteam2.season,
          match: tu.team1Vteam2.id,
          matchSlug: tu.team1Vteam2.slug,
          gameRound: tu.team1Vteam2.gameRound,
          user: users[0].id,
          choice: {
            goalsHomeTeam: 1,
            goalsAwayTeam: 0,
          },
          scorePoints: {
            points: 4,
            APoints: 0,
            BPoints: 4,
            CorrectMatchOutcomePoints: 0,
            ExactGoalDifferencePoints: 0,
            ExactMatchScorePoints: 0,
            CloseMatchScorePoints: 1,
            SpreadTeamScorePoints: 2,
            ExactTeamScorePoints: 1,
          },
        };
        tu.user1_team3Vteam4 = {
          ...tu.user1_team3Vteam4,
          season: tu.team3Vteam4.season,
          match: tu.team3Vteam4.id,
          matchSlug: tu.team3Vteam4.slug,
          gameRound: tu.team3Vteam4.gameRound,
          user: users[0].id,
          hasJoker: true,
          choice: {
            goalsHomeTeam: 2,
            goalsAwayTeam: 1,
          },
          scorePoints: {
            points: 9,
            APoints: 5,
            BPoints: 4,
            CorrectMatchOutcomePoints: 5,
            ExactGoalDifferencePoints: 0,
            ExactMatchScorePoints: 0,
            CloseMatchScorePoints: 1,
            SpreadTeamScorePoints: 2,
            ExactTeamScorePoints: 1,
          },
        };
        tu.user2_team1Vteam2 = {
          ...tu.user2_team1Vteam2,
          season: tu.team1Vteam2.season,
          match: tu.team1Vteam2.id,
          matchSlug: tu.team1Vteam2.slug,
          gameRound: tu.team1Vteam2.gameRound,
          user: users[1].id,
          choice: {
            goalsHomeTeam: 2,
            goalsAwayTeam: 2,
          },
          scorePoints: {
            points: 6,
            APoints: 6,
            BPoints: 0,
            CorrectMatchOutcomePoints: 5,
            ExactGoalDifferencePoints: 1,
            ExactMatchScorePoints: 0,
            CloseMatchScorePoints: 0,
            SpreadTeamScorePoints: 0,
            ExactTeamScorePoints: 0,
          },
        };
        tu.user2_team3Vteam4 = {
          ...tu.user2_team3Vteam4,
          season: tu.team3Vteam4.season,
          match: tu.team3Vteam4.id,
          matchSlug: tu.team3Vteam4.slug,
          gameRound: tu.team3Vteam4.gameRound,

          user: users[1].id,
          choice: {
            goalsHomeTeam: 3,
            goalsAwayTeam: 1,
          },
          scorePoints: {
            points: 8,
            APoints: 6,
            BPoints: 2,
            CorrectMatchOutcomePoints: 5,
            ExactGoalDifferencePoints: 1,
            ExactMatchScorePoints: 0,
            CloseMatchScorePoints: 0,
            SpreadTeamScorePoints: 2,
            ExactTeamScorePoints: 0,
          },
        };

        return db.Prediction.create([
          tu.user1_team1Vteam2,
          tu.user1_team3Vteam4,
          tu.user2_team1Vteam2,
          tu.user2_team3Vteam4,
        ]);
      })
      .then(_ => {
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

  it('should update rankings => second take', async () => {
    const c1 = await leaderboardUpdater.updateScores([tu.team1Vteam2]);

    const c2 = await leaderboardUpdater.updateRankings(tu.season.id!);

    const c3 = await leaderboardUpdater.updateScores([tu.team3Vteam4]);

    const c4 = await leaderboardUpdater.updateRankings(tu.season.id!);

    const users = await db.UserScore.find({}).exec();

    const boards = await db.Leaderboard.find({}).exec();
  });
});
