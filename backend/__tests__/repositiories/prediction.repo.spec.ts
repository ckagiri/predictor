import { flatMap } from 'rxjs/operators';
import { expect } from 'chai';

import * as db from '../../db';
import { User, UserModel } from '../../db/models/user.model';
import {
  Competition,
  CompetitionModel,
} from '../../db/models/competition.model';
import { Season, SeasonModel } from '../../db/models/season.model';
import { Team, TeamModel } from '../../db/models/team.model';
import { Match, MatchModel, MatchStatus } from '../../db/models/match.model';
import {
  Prediction,
  PredictionModel,
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

const epl: CompetitionModel = {
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'epl',
};

const epl18: SeasonModel = {
  name: '2018-2019',
  slug: '2018-19',
  year: 2018,
  seasonStart: '2017-08-11T00:00:00+0200',
  seasonEnd: '2018-05-13T16:00:00+0200',
  currentMatchRound: 20,
  currentGameRound: 20,
  competition: undefined,
};

const manu: TeamModel = {
  name: 'Manchester United FC',
  shortName: 'Man United',
  code: 'MUN',
  slug: 'man_united',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
  aliases: ['ManU', 'ManUtd'],
};

const manc: TeamModel = {
  name: 'Manchester City FC',
  shortName: 'Man City',
  code: 'MCI',
  slug: 'man_city',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_City_FC.svg',
  aliases: ['ManCity'],
};

const che: TeamModel = {
  name: 'Chelsea FC',
  shortName: 'Chelsea',
  code: 'CHE',
  slug: 'chelsea',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Chelsea_FC.svg',
  aliases: ['Chelsea'],
};

const ars: TeamModel = {
  name: 'Arsenal FC',
  shortName: 'Arsenal',
  code: 'ARS',
  slug: 'arsenal',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Arsenal_FC.svg',
  aliases: ['Arsenal'],
};

const manuVmanc: MatchModel = {
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

const cheVars: MatchModel = {
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

const chalo: UserModel = {
  username: 'chalo',
  email: 'chalo@example.com',
};

const kagiri: UserModel = {
  username: 'kagiri',
  email: 'kagiri@example.com',
};

describe('Prediction repo', function() {
  this.timeout(5000);

  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
  });

  beforeEach(done => {
    User.create([chalo, kagiri])
      .then(users => {
        user1 = users[0];
        return Competition.create(epl);
      })
      .then(l => {
        const { name, slug, id } = l;
        epl18.competition = { name, slug, id: id! };
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

        return Match.create([manuVmanc, cheVars]);
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
    let prediction: PredictionModel;
    const { slug: matchSlug, season, gameRound, id: matchId } = match1;
    const pred: PredictionModel = {
      user: user1.id,
      match: matchId,
      matchSlug,
      season,
      gameRound,
      choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true },
    };
    Prediction.create(pred)
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
            SpreadTeamScorePoints: 0,
            ExactTeamScorePoints: 3,
          };
          return predictionRepo.findByIdAndUpdate$(p.id!, { scorePoints });
        }),
      )
      .subscribe(p => {
        const pred = (p as PredictionDocument).toObject() as PredictionModel;
        expect(pred.scorePoints).to.eql(scorePoints);
        done();
      });
  });
});
