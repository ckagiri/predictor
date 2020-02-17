import 'mocha';
import { expect } from 'chai';
import { flatMap } from 'rxjs/operators';

import * as db from '../../db/index';
import { config } from '../../config/environment/index';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { League } from '../../db/models/league.model';
import { Season } from '../../db/models/season.model';
import { Team } from '../../db/models/team.model';

import { FixtureRepository } from '../../db/repositories/fixture.repo';

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
  league: null,
  externalReference: null,
};

const afdEpl17 = {
  id: 445,
  caption: 'Premier League 2017/18',
  league: 'PL',
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
const fixtureRepo = FixtureRepository.getInstance(
  ApiProvider.API_FOOTBALL_DATA,
);
const ligiFixtureRepo = FixtureRepository.getInstance(ApiProvider.LIGI);
let season: any;
let team1: any;
let team2: any;

describe('FixtureRepo', function () {
  this.timeout(5000);
  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
  });
  beforeEach(done => {
    League.create(epl)
      .then(l => {
        const { name, slug, id } = l;
        const theEpl17 = {
          ...epl17,
          league: { name, slug, id },
          externalReference: {
            [ApiProvider.API_FOOTBALL_DATA]: { id: afdEpl17.id },
          },
        };
        return Season.create(theEpl17);
      })
      .then(s => {
        season = s;
        return Team.create([manu, manc]);
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
  it('should save a fixture', done => {
    manuVmanc.seasonId = season.id;
    manuVmanc.homeTeamId = team1.id;
    manuVmanc.awayTeamId = team2.id;

    ligiFixtureRepo.save$(manuVmanc).subscribe(fixture => {
      expect(fixture.season!.toString()).to.equal(season.id);
      expect(fixture.slug).to.equal(`${team1.slug}-v-${team2.slug}`);
      done();
    });
  });

  it('should findEach By SeasonAndTeams AndUpdateOrCreate', done => {
    fixtureRepo
      .findBySeasonAndTeamsAndUpsert$(afdManuVmanc)
      .subscribe(fixture => {
        expect(fixture.season!.toString()).to.equal(season.id);
        expect(fixture.slug).to.equal(`${team1.slug}-v-${team2.slug}`);
        done();
      });
  });

  it('should find finished fixtures with pending predictions', done => {
    fixtureRepo
      .findBySeasonAndTeamsAndUpsert$(afdManuVmanc)
      .pipe(
        flatMap(_ => {
          return fixtureRepo.findAllFinishedWithPendingPredictions$(season.id);
        }),
      )
      .subscribe(fs => {
        expect(fs).to.have.length(1);
        done();
      });
  });

  it('should find selectable fixtures for game round', done => {
    manuVmanc.seasonId = season.id;
    manuVmanc.homeTeamId = team1.id;
    manuVmanc.awayTeamId = team2.id;

    ligiFixtureRepo
      .save$(manuVmanc)
      .pipe(
        flatMap(_ => {
          return fixtureRepo.findSelectableFixtures$(
            season.id,
            season.currentGameRound,
          );
        }),
      )
      .subscribe(fs => {
        expect(fs).to.have.length(1);
        done();
      });
  });
});
