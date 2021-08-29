import { flatMap } from 'rxjs/operators';
import { expect } from 'chai';

import db from '../../db';
import { User, Competition, Season, Team } from '../../db/models';
import { Match, MatchStatus } from '../../db/models/match.model';
import {
  Prediction,
  PredictionDocument,
} from '../../db/models/prediction.model';

import { ScorePoints } from '../../common/score';
import { PredictionRepositoryImpl } from '../../db/repositories/prediction.repo';

const predictionRepo = PredictionRepositoryImpl.getInstance();
// tslint:disable-next-line: one-variable-per-declaration
let user1: any,
  theSeason: any,
  team1: any,
  team2: any,
  team3: any,
  team4: any,
  match1: any;

const epl: Competition = {
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'epl',
};

const epl18: Season = {
  name: '2018-2019',
  slug: '2018-19',
  year: 2018,
  seasonStart: '2017-08-11T00:00:00+0200',
  seasonEnd: '2018-05-13T16:00:00+0200',
  currentMatchRound: 20,
  currentGameRound: 20,
  competition: undefined,
};

const manu: Team = {
  name: 'Manchester United FC',
  shortName: 'Man United',
  code: 'MUN',
  slug: 'man_united',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
  aliases: ['ManU', 'ManUtd'],
};

const manc: Team = {
  name: 'Manchester City FC',
  shortName: 'Man City',
  code: 'MCI',
  slug: 'man_city',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_City_FC.svg',
  aliases: ['ManCity'],
};

const che: Team = {
  name: 'Chelsea FC',
  shortName: 'Chelsea',
  code: 'CHE',
  slug: 'chelsea',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Chelsea_FC.svg',
  aliases: ['Chelsea'],
};

const ars: Team = {
  name: 'Arsenal FC',
  shortName: 'Arsenal',
  code: 'ARS',
  slug: 'arsenal',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Arsenal_FC.svg',
  aliases: ['Arsenal'],
};

const manuVmanc: Match = {
  date: '2018-09-10T11:30:00Z',
  status: MatchStatus.SCHEDULED,
  matchRound: 20,
  gameRound: 20,
  season: undefined,
  homeTeam: undefined,
  awayTeam: undefined,
  slug: 'manu-v-manc',
  result: undefined,
};

const cheVars: Match = {
  date: '2018-09-10T11:30:00Z',
  status: MatchStatus.SCHEDULED,
  matchRound: 20,
  gameRound: 20,
  season: undefined,
  homeTeam: undefined,
  awayTeam: undefined,
  slug: 'che-v-ars',
  result: undefined,
};

const chalo: User = {
  username: 'chalo',
  email: 'chalo@example.com',
};

const kagiri: User = {
  username: 'kagiri',
  email: 'kagiri@example.com',
};

describe('Prediction repo', function () {
  this.timeout(5000);

  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
  });

  beforeEach(done => {
    db.User.create([chalo, kagiri])
      .then(users => {
        user1 = users[0];
        return db.Competition.create(epl);
      })
      .then(l => {
        const { name, slug, id } = l;
        epl18.competition = { name, slug, id: id! };
        return db.Season.create(epl18);
      })
      .then(s => {
        theSeason = s;
        return db.Team.create([manu, manc, che, ars]);
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
          crestUrl: manu.crestUrl!,
        };
        manuVmanc.awayTeam = {
          name: team2.name,
          slug: team2.slug,
          id: team2._id,
          crestUrl: manc.crestUrl!,
        };
        manuVmanc.slug = `${team1.slug}-${team2.slug}`;
        cheVars.homeTeam = {
          name: team3.name,
          slug: team3.slug,
          id: team3._id,
          crestUrl: che.crestUrl!,
        };
        cheVars.awayTeam = {
          name: team4.name,
          slug: team4.slug,
          id: team4._id,
          crestUrl: ars.crestUrl!,
        };
        cheVars.slug = `${team3.slug}-${team4.slug}`;

        return db.Match.create([manuVmanc, cheVars]);
      })
      .then(matches => {
        match1 = matches[0];
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
        .findOrCreateJoker$(
          user1.id,
          theSeason.id,
          theSeason.currentGameRound,
          [match1.id],
        )
        .subscribe(p => {
          expect(p).to.have.property('hasJoker', true);
          expect(p).to.have.property('jokerAutoPicked', true);
          done();
        });
    });
  });

  it('should findOne prediction by user and match', done => {
    let prediction: Prediction;
    const { slug: matchSlug, season, gameRound, id: matchId } = match1;
    const pred: Prediction = {
      user: user1.id,
      match: matchId,
      matchSlug,
      season,
      gameRound,
      choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true },
    };
    db.Prediction.create(pred)
      .then(p => {
        prediction = p;
        return predictionRepo
          .findOne$({ userId: user1.id, matchId: match1.id })
          .toPromise();
      })
      .then(p => {
        expect(p.id).to.equal(prediction.id);
        done();
      });
  });

  describe('findOneOrCreate prediction', () => {
    it('should create prediction if it doesnt exist', done => {
      predictionRepo
        .findOneOrCreate$({ userId: user1.id, matchId: match1.id })
        .subscribe(p => {
          expect(p.user.toString()).to.equal(user1.id);
          expect(p.match.toString()).to.equal(match1.id);
          expect(p.matchSlug).to.equal(match1.slug);
          expect(p).to.have.property('hasJoker', false);
          expect(p).to.have.property('jokerAutoPicked', false);
          done();
        });
    });
    it('should return existing prediction', done => {
      let prediction: PredictionDocument;
      predictionRepo
        .findOneOrCreate$({ userId: user1.id, matchId: match1.id })
        .pipe(
          flatMap(p => {
            prediction = p as PredictionDocument;
            return predictionRepo.findOneOrCreate$({
              userId: user1.id,
              matchId: match1.id,
            });
          }),
        )
        .subscribe(p => {
          expect((p as PredictionDocument).toObject()).to.eql(
            prediction.toObject(),
          );
          done();
        });
    });
  });

  it('should findById And update score', done => {
    let scorePoints: ScorePoints;
    predictionRepo
      .findOneOrCreate$({ userId: user1.id, matchId: match1.id })
      .pipe(
        flatMap(p => {
          scorePoints = {
            points: 7,
            APoints: 7,
            BPoints: 0,
            CorrectMatchOutcomePoints: 4,
            ExactGoalDifferencePoints: 0,
            ExactMatchScorePoints: 0,
            CloseMatchScorePoints: 0,
            ExactTeamScorePoints: 3,
          };
          return predictionRepo.findByIdAndUpdate$(p.id!, { scorePoints });
        }),
      )
      .subscribe(p => {
        const pred = (p as PredictionDocument).toObject() as Prediction;
        expect(pred.scorePoints).to.eql(scorePoints);
        done();
      });
  });
});
