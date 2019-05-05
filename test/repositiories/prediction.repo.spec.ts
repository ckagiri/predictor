import { flatMap } from 'rxjs/operators';
import { Document } from 'mongoose';
import { expect } from 'chai';

import * as db from '../../src/db';
import { config } from '../../src/config/environment';
import { User, IUser } from '../../src/db/models/user.model';
import { League, ILeague } from '../../src/db/models/league.model';
import { Season, ISeason } from '../../src/db/models/season.model';
import { Team, ITeam } from '../../src/db/models/team.model';
import { Fixture, IFixture, FixtureStatus } from '../../src/db/models/fixture.model';
import { Prediction, IPrediction, IPredictionDocument } from '../../src/db/models/prediction.model';

import { ScorePoints } from '../../src/common/score';
import { PredictionRepository } from '../../src/db/repositories/prediction.repo';

const predictionRepo = PredictionRepository.getInstance();
// tslint:disable-next-line: one-variable-per-declaration
let user1: any,
  user2: any,
  theLeague: any,
  theSeason: any,
  team1: any,
  team2: any,
  team3: any,
  team4: any,
  fixture1: any,
  fixture2: any;

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
  date: '2018-09-10T11:30:00Z',
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
  date: '2018-09-10T11:30:00Z',
  status: FixtureStatus.SCHEDULED,
  matchRound: 20,
  gameRound: 20,
  season: undefined,
  homeTeam: undefined,
  awayTeam: undefined,
  slug: 'che-v-ars',
  result: undefined
};

const chalo: IUser = {
  username: 'chalo',
  email: 'chalo@example.com'
};

const kagiri: IUser = {
  username: 'kagiri',
  email: 'kagiri@example.com'
};

describe('Prediction repo', function() {
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
        theLeague = l;
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
          crestUrl: manu.crestUrl!
        };
        manuVmanc.awayTeam = {
          name: team2.name,
          slug: team2.slug,
          id: team2._id,
          crestUrl: manc.crestUrl!
        };
        manuVmanc.slug = `${team1.slug}-${team2.slug}`;
        cheVars.homeTeam = {
          name: team3.name,
          slug: team3.slug,
          id: team3._id,
          crestUrl: che.crestUrl!
        };
        cheVars.awayTeam = {
          name: team4.name,
          slug: team4.slug,
          id: team4._id,
          crestUrl: ars.crestUrl!
        };
        cheVars.slug = `${team3.slug}-${team4.slug}`;

        return Fixture.create([manuVmanc, cheVars]);
      })
      .then(fixtures => {
        fixture1 = fixtures[0];
        fixture2 = fixtures[1];
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

  describe('findOrCreate joker', () => {
    it('should create joker if it doesnt exist', done => {
      predictionRepo
        .findOrCreateJoker$(user1.id, theSeason.id, theSeason.currentGameRound, [fixture1.id])
        .subscribe(p => {
          expect(p).to.have.property('hasJoker', true);
          expect(p).to.have.property('jokerAutoPicked', true);
          done();
        });
    });
  });

  it('should findOne prediction by user and fixture', done => {
    let prediction: IPrediction;
    const { slug: fixtureSlug, season, gameRound, odds, id: fixtureId } = fixture1;
    const pred: IPrediction = {
      user: user1.id,
      fixture: fixtureId,
      fixtureSlug,
      season,
      gameRound,
      choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true }
    };
    Prediction.create(pred)
      .then(p => {
        prediction = p;
        return predictionRepo.findOne$({ userId: user1.id, fixtureId: fixture1.id }).toPromise();
      })
      .then(p => {
        expect(p.id).to.equal(prediction.id);
        done();
      });
  });

  describe('findOneOrCreate prediction', () => {
    it('should create prediction if it doesnt exist', done => {
      predictionRepo.findOneOrCreate$({ userId: user1.id, fixtureId: fixture1.id }).subscribe(p => {
        expect(p.user.toString()).to.equal(user1.id);
        expect(p.fixture.toString()).to.equal(fixture1.id);
        expect(p.fixtureSlug).to.equal(fixture1.slug);
        expect(p).to.have.property('hasJoker', false);
        expect(p).to.have.property('jokerAutoPicked', false);
        done();
      });
    });
    it('should return existing prediction', done => {
      type Prd = IPrediction | Document;
      let prediction: IPredictionDocument;
      predictionRepo
        .findOneOrCreate$({ userId: user1.id, fixtureId: fixture1.id })
        .pipe(
          flatMap(p => {
            prediction = p as IPredictionDocument;
            return predictionRepo.findOneOrCreate$({ userId: user1.id, fixtureId: fixture1.id });
          })
        )
        .subscribe(p => {
          expect((p as IPredictionDocument).toObject()).to.eql(prediction.toObject());
          done();
        });
    });
  });

  it('should findById And update score', done => {
    let scorePoints: ScorePoints;
    predictionRepo
      .findOneOrCreate$({ userId: user1.id, fixtureId: fixture1.id })
      .pipe(
        flatMap(p => {
          scorePoints = {
            points: 7,
            APoints: 7,
            BPoints: 0,
            MatchOutcomePoints: 4,
            TeamScorePlusPoints: 3,
            GoalDifferencePoints: 0,
            ExactScorePoints: 0,
            TeamScoreMinusPoints: 0
          };
          return predictionRepo.findByIdAndUpdate$(p.id!, { scorePoints });
        })
      )
      .subscribe(p => {
        const pred = (p as IPredictionDocument).toObject() as IPrediction;
        expect(pred.scorePoints).to.eql(scorePoints);
        done();
      });
  });
});
