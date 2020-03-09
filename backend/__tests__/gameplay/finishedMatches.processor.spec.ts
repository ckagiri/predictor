import { expect } from 'chai';

import { Competition, Team } from '../../db/models';
import { MatchStatus } from '../../db/models/match.model';
import db from '../../db';
import testUtils, { TestUtils } from './testUtils';
import { FinishedMatchesProcessorImpl } from '../../app/schedulers/finishedMatches.processor';

const finishedMatchesProcessor = FinishedMatchesProcessorImpl.getInstance();
let tu: TestUtils = JSON.parse(JSON.stringify(testUtils));

describe('Finished Matches Processor', function() {
  this.timeout(5000);

  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
  });

  beforeEach(done => {
    db.Competition.create(tu.league)
      .then(league => {
        let { name, slug, id } = league;
        tu.season.competition = {
          name,
          slug,
          id,
        } as Required<Competition>;
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
        };
        tu.user1_team3Vteam4 = {
          ...tu.user1_team3Vteam4,
          season: tu.team3Vteam4.season,
          match: tu.team3Vteam4.id,
          matchSlug: tu.team3Vteam4.slug,
          gameRound: tu.team3Vteam4.gameRound,
          user: users[0].id,
        };
        tu.user2_team1Vteam2 = {
          ...tu.user2_team1Vteam2,
          season: tu.team1Vteam2.season,
          match: tu.team1Vteam2.id,
          matchSlug: tu.team1Vteam2.slug,
          gameRound: tu.team1Vteam2.gameRound,
          user: users[1].id,
        };
        tu.user2_team3Vteam4 = {
          ...tu.user2_team3Vteam4,
          season: tu.team3Vteam4.season,
          match: tu.team3Vteam4.id,
          matchSlug: tu.team3Vteam4.slug,
          gameRound: tu.team3Vteam4.gameRound,
          user: users[1].id,
        };

        return db.Prediction.create([
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

  it('should process predictions', async () => {
    tu.team1Vteam2.status = MatchStatus.FINISHED;
    tu.team1Vteam2.result = {
      goalsHomeTeam: 0,
      goalsAwayTeam: 0,
    };
    tu.team3Vteam4.status = MatchStatus.FINISHED;
    tu.team3Vteam4.result = {
      goalsHomeTeam: 2,
      goalsAwayTeam: 0,
    };

    const count = await finishedMatchesProcessor.processPredictions([
      tu.team1Vteam2,
      tu.team3Vteam4,
    ]);

    expect(count).to.equal(4);

    const preds = await db.Prediction.find({}).exec();
    expect(preds.length).to.be.greaterThan(0);
  });

  it.skip('should set to true allPredictionProcessed', async () => {
    db.Match.find({})
      .exec()
      .then(() => {});
  });
});
