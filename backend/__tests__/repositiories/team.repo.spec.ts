import 'mocha';
import { expect } from 'chai';
import { flatMap } from 'rxjs/operators';

import * as db from '../../db/index';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { TeamRepositoryImpl } from '../../db/repositories/team.repo';
import TeamModel from '../../db/models/team.model';
import SeasonModel from '../../db/models/season.model';
import memoryDb from '../memoryDb';

const manu = {
  id: undefined,
  name: 'Manchester United FC',
  shortName: 'Man United',
  code: 'mun',
  slug: 'man_united',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
  aliases: ['ManU', 'ManUtd'],
};

const manc = {
  id: undefined,
  name: 'Manchester City FC',
  shortName: 'Man City',
  code: 'mci',
  slug: 'man_city',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_City_FC.svg',
  aliases: ['ManCity'],
};

const brazil = {
  id: undefined,
  name: 'Brazil National Team',
  shortName: 'Brazil',
  code: 'bra',
  slug: 'brazil',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Brasil.svg',
  aliases: ['ManCity'],
};

const afdManu = {
  id: 66,
  name: 'Manchester United FC',
  shortName: 'ManU',
  squadMarketValue: null,
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
};

const afdManc = {
  id: 67,
  name: 'Manchester City FC',
  shortName: 'ManCity',
  squadMarketValue: null,
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_City_FC.svg',
};

describe('teamRepo', function() {
  before(async () => {
    await memoryDb.connect();
  });

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  after(async () => {
    await memoryDb.close();
  });

  it('should save a new Team', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(ApiProvider.LIGI);

    teamRepo.save$(manu).subscribe(
      (t: any) => {
        expect(t.name).to.equal(manu.name);
        expect(t.slug).to.equal(manu.slug);
        expect(t.aliases).to.contain('ManU', 'ManUtd');
        expect(t.aliases).to.have.length(2);
        done();
      },
      () => {
        done();
      },
    );
  });

  it('should findByName using name', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    teamRepo
      .insert$(manu)
      .pipe(
        flatMap(_ => {
          return teamRepo.findByName$(manu.name);
        }),
      )
      .subscribe(
        (t: any) => {
          expect(t.name).to.equal(manu.name);
          done();
        },
        () => {
          done();
        },
      );
  });

  it('should findByName using shortName', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    teamRepo
      .insert$(manu)
      .pipe(
        flatMap(_ => {
          return teamRepo.findByName$(manu.shortName);
        }),
      )
      .subscribe(
        (t: any) => {
          expect(t.name).to.equal(manu.name);

          done();
        },
        () => {
          done();
        },
      );
  });

  it('should findByName using alias', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    teamRepo
      .insert$(manu)
      .pipe(
        flatMap(_ => {
          return teamRepo.findByName$(manu.aliases[0]);
        }),
      )
      .subscribe(
        (t: any) => {
          expect(t.name).to.equal(manu.name);

          done();
        },
        () => {
          done();
        },
      );
  });

  it('should findByNameAndUpsert', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    teamRepo
      .insert$(manu)
      .pipe(
        flatMap(_ => {
          return teamRepo.findByNameAndUpsert$(afdManu);
        }),
      )
      .subscribe(
        (t: any) => {
          expect(t.name).to.equal(manu.name);
          expect(t.externalReference).to.have.ownProperty(
            ApiProvider.API_FOOTBALL_DATA,
          );

          done();
        },
        () => {
          done();
        },
      );
  });

  it('should retain external reference when doing findByNameAndUpsert', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );
    const theManu = {
      ...manu,
      externalReference: { SomeOtherApi: { id: 'someExternalId' } },
    };
    teamRepo
      .insert$(theManu)
      .pipe(
        flatMap(_ => {
          return teamRepo.findByNameAndUpsert$(afdManu);
        }),
      )
      .subscribe(
        t => {
          expect(t.name).to.equal(theManu.name);
          expect(t.externalReference).to.have.ownProperty('SomeOtherApi');
          expect(t.externalReference).to.have.ownProperty(
            ApiProvider.API_FOOTBALL_DATA,
          );
          done();
        },
        () => {
          done();
        },
      );
  });

  it('should findEachByNameAndUpert', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(ApiProvider.LIGI);

    teamRepo
      .insertMany$([manu, manc])
      .pipe(
        flatMap(_ => {
          return teamRepo.findEachByNameAndUpsert$([afdManu, afdManc]);
        }),
      )
      .subscribe(
        (ts: any) => {
          expect(ts[0].name).to.equal(manu.name);
          expect(ts[1].name).to.equal(manc.name);

          done();
        },
        () => {
          done();
        },
      );
  });

  it.only('should findAll by season', async () => {
    const teamRepo = TeamRepositoryImpl.getInstance(ApiProvider.LIGI);
    const teams = await Promise.all([
      new TeamModel(manu).save(),
      new TeamModel(manc).save(),
      new TeamModel(brazil).save(),
    ]);
    const season = new SeasonModel({
      name: '2017-2018',
      slug: '17-18',
      year: 2017,
      competition: {
        name: 'English Premier League',
        slug: 'english_premier_league',
        id: '4edd40c86762e0fb12000003',
      },
      seasonStart: '2017-08-11T00:00:00+0200',
      seasonEnd: '2018-05-13T16:00:00+0200',
      teams: teams.filter(t => t.code !== 'bra').map(t => t._id),
    });
    await season.save();

    const seasonTeams = await teamRepo.getAllBySeason$(season.id).toPromise();
    expect(seasonTeams).to.have.length(2);
  });
});
