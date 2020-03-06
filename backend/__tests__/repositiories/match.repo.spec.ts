import 'mocha';
import { expect } from 'chai';
import { flatMap } from 'rxjs/operators';
import db from '../../db';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { MatchRepositoryImpl } from '../../db/repositories/match.repo';

const epl = {
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'epl',
};

const epl17 = {
  name: '2017-2018',
  slug: '17-18',
  year: 2017,
  seasonStart: '2017-08-11T00:00:00+0200',
  seasonEnd: '2018-05-13T16:00:00+0200',
  currentMatchRound: 20,
  currentGameRound: 20,
  competition: null,
  externalReference: null,
};

const afdEpl17 = {
  id: 445,
  caption: 'Premier League 2017/18',
  competition: 'PL',
  year: '2017',
  currentMatchday: 20,
  numberOfMatchdays: 38,
  numberOfTeams: 20,
  numberOfGames: 380,
};

const manu = {
  name: 'Manchester United FC',
  shortName: 'Man United',
  code: 'MUN',
  slug: 'man_united',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
  aliases: ['ManU', 'ManUtd'],
};

const manc = {
  name: 'Manchester City FC',
  shortName: 'Man City',
  code: 'MCI',
  slug: 'man_city',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_City_FC.svg',
  aliases: ['ManCity'],
};

const manuVmanc = {
  id: undefined,
  season: {},
  seasonId: undefined,
  date: '2017-09-10T11:30:00Z',
  status: 'SCHEDULED',
  matchRound: 20,
  gameRound: 20,
  homeTeamId: null,
  awayTeamId: null,
  result: {},
};
const afdManuVmanc = {
  id: 233371,
  season: {
    id: 445,
  },
  utcDate: '2019-04-20T14:00:00Z',
  status: 'FINISHED',
  matchday: 35,
  score: {
    fullTime: {
      homeTeam: 1,
      awayTeam: 2,
    },
  },
  homeTeam: {
    id: 66,
    name: 'Manchester United FC',
  },
  awayTeam: {
    id: 65,
    name: 'Manchester City FC',
  },
  odds: {
    homeWin: 2.3,
    draw: 3.25,
    awayWin: 3.4,
  },
};
const matchRepo = MatchRepositoryImpl.getInstance(
  ApiProvider.API_FOOTBALL_DATA,
);
const ligiMatchRepo = MatchRepositoryImpl.getInstance(ApiProvider.LIGI);
let season: any;
let team1: any;
let team2: any;

describe('MatchRepo', function () {
  this.timeout(5000);
  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
  });
  beforeEach(done => {
    db.Competition.create(epl)
      .then(c => {
        const { name, slug, id } = c;
        const theEpl17 = {
          ...epl17,
          competition: { name, slug, id },
          externalReference: {
            [ApiProvider.API_FOOTBALL_DATA]: { id: afdEpl17.id },
          },
        };
        return db.Season.create(theEpl17);
      })
      .then(s => {
        season = s;
        return db.Team.create([manu, manc]);
      })
      .then(teams => {
        team1 = teams[0];
        team2 = teams[1];
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
  it('should save a match', done => {
    manuVmanc.seasonId = season.id;
    manuVmanc.homeTeamId = team1.id;
    manuVmanc.awayTeamId = team2.id;

    ligiMatchRepo.save$(manuVmanc).subscribe(match => {
      expect(match.season!.toString()).to.equal(season.id);
      expect(match.slug).to.equal(`${team1.slug}-v-${team2.slug}`);
      done();
    });
  });

  it('should findEach By SeasonAndTeams AndUpdateOrCreate', done => {
    matchRepo.findBySeasonAndTeamsAndUpsert$(afdManuVmanc).subscribe(match => {
      expect(match.season!.toString()).to.equal(season.id);
      expect(match.slug).to.equal(`${team1.slug}-v-${team2.slug}`);
      done();
    });
  });

  it('should find finished matches with pending predictions', done => {
    matchRepo
      .findBySeasonAndTeamsAndUpsert$(afdManuVmanc)
      .pipe(
        flatMap(_ => {
          return matchRepo.findAllFinishedWithPendingPredictions$(season.id);
        }),
      )
      .subscribe(fs => {
        expect(fs).to.have.length(1);
        done();
      });
  });

  it('should find selectable matches for game round', done => {
    manuVmanc.seasonId = season.id;
    manuVmanc.homeTeamId = team1.id;
    manuVmanc.awayTeamId = team2.id;

    ligiMatchRepo
      .save$(manuVmanc)
      .pipe(
        flatMap(_ => {
          return matchRepo.findSelectableMatches$(
            season.id,
            season.currentGameRound,
          );
        }),
      )
      .subscribe(ms => {
        expect(ms).to.have.length(1);
        done();
      });
  });
});
