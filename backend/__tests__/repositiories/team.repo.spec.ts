import 'mocha';
import { expect } from 'chai';
import { flatMap } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { TeamRepositoryImpl } from '../../db/repositories/team.repo';
import memoryDb from '../memoryDb';
import a from '../a';

const manUtd = {
  id: 'abc1',
  name: 'Manchester United FC',
  shortName: 'Man United',
  code: 'mun',
  slug: 'man-united',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
  aliases: ['ManU', 'ManUtd'],
};

const manCity = {
  id: 'abc2',
  name: 'Manchester City FC',
  shortName: 'Man City',
  code: 'mci',
  slug: 'man-city',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_City_FC.svg',
  aliases: ['ManCity'],
};

const afdManUtd = {
  id: 66,
  name: 'Manchester United FC',
  shortName: 'ManU',
  squadMarketValue: null,
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
};

const afdManCity = {
  id: 67,
  name: 'Manchester City FC',
  shortName: 'ManCity',
  squadMarketValue: null,
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_City_FC.svg',
};

const brazil = {
  id: 'abc3',
  name: 'Brazil National Team',
  shortName: 'Brazil',
  code: 'bra',
  slug: 'brazil',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Brasil.svg',
  aliases: ['ManCity'],
};

describe('teamRepo', function () {
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

    teamRepo.save$(manUtd).subscribe(
      team => {
        expect(team.name).to.equal(manUtd.name);
        expect(team.slug).to.equal(manUtd.slug);
        expect(team.aliases).to.contain('ManU', 'ManUtd');
        expect(team.aliases).to.have.length(2);
        done();
      }
    );
  });

  it('should findByName using name', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    teamRepo
      .insert$(manUtd)
      .pipe(
        flatMap(_ => {
          return teamRepo.findByName$(manUtd.name);
        }),
      )
      .subscribe(
        team => {
          expect(team.name).to.equal(manUtd.name);
          done();
        }
      );
  });

  it('should findByName using shortName', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    teamRepo
      .insert$(manUtd)
      .pipe(
        flatMap(_ => {
          return teamRepo.findByName$(manUtd.shortName);
        }),
      )
      .subscribe(
        team => {
          expect(team.name).to.equal(manUtd.name);
          done();
        }
      );
  });

  it('should findByName using alias', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    teamRepo
      .insert$(manUtd)
      .pipe(
        flatMap(_ => {
          return teamRepo.findByName$(manUtd.aliases[0]);
        }),
      )
      .subscribe(
        team => {
          expect(team.name).to.equal(manUtd.name);

          done();
        }
      );
  });

  it('should findByNameAndUpsert with api team', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    // check to see if we have an external reference
    // check shortName it would be preferable if such prop could be excluded from the patch object
    teamRepo
      .insert$(manUtd)
      .pipe(
        flatMap(_ => {
          return teamRepo.findByNameAndUpsert$(afdManUtd);
        }),
      )
      .subscribe(
        team => {
          expect(team.name).to.equal(manUtd.name);
          expect(team.shortName).to.not.equal(manUtd.shortName)
          expect(team.shortName).to.equal(afdManUtd.shortName)
          expect(team.externalReference).to.have.ownProperty(
            ApiProvider.API_FOOTBALL_DATA,
          );

          done();
        }
      );
  });

  it('should retain external reference when doing findByNameAndUpsert', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );
    const teamManUtd = {
      ...manUtd,
      externalReference: { SomeOtherApi: { id: 'someExternalId' } },
    };
    teamRepo
      .insert$(teamManUtd)
      .pipe(
        flatMap(_ => {
          return teamRepo.findByNameAndUpsert$(afdManUtd);
        }),
      )
      .subscribe(
        team => {
          expect(team.name).to.equal(teamManUtd.name);
          expect(team.shortName).to.not.equal(manUtd.shortName)
          expect(team.shortName).to.equal(afdManUtd.shortName)
          expect(team.externalReference).to.have.ownProperty('SomeOtherApi');
          expect(team.externalReference).to.have.ownProperty(
            ApiProvider.API_FOOTBALL_DATA,
          );
          done();
        }
      );
  });

  it('should findEachByNameAndUpert', done => {
    const teamRepo = TeamRepositoryImpl.getInstance(ApiProvider.LIGI);

    teamRepo
      .insertMany$([manUtd, manCity])
      .pipe(
        flatMap(_ => {
          return teamRepo.findEachByNameAndUpsert$([afdManUtd, afdManCity]);
        }),
      )
      .subscribe(
        teams => {
          expect(teams[0].name).to.equal(manUtd.name);
          expect(teams[0].shortName).to.not.equal(manUtd.shortName)
          expect(teams[0].shortName).to.equal(afdManUtd.shortName)

          expect(teams[1].name).to.equal(manCity.name);
          expect(teams[1].shortName).to.not.equal(manCity.shortName)
          expect(teams[1].shortName).to.equal(afdManCity.shortName)
          done();
        }
      );
  });

  it('should findAll by season', async () => {
    const epl = a.competition
      .setName('English Premier League')
      .setSlug('english-premier-league')
      .setCode('epl');

    const epl2022 = a.season
      .withCompetition(epl)
      .setName('2021-2022')
      .setSlug('2021-22')
      .setYear(2022)
      .setSeasonStart('2021-08-09T00:00:00+0200')
      .setSeasonEnd('2022-05-17T16:00:00+0200')
      .setExternalReference({
        [ApiProvider.API_FOOTBALL_DATA]: { id: 445 },
      })

    const manUtd = a.team.setName('Manchester United').setSlug('man-utd');
    const manCity = a.team.setName('Manchester City').setSlug('man-city');
    const brazil = a.team.setName('Brazil').setSlug('brazil');

    const gameData = await a.game
      .withTeams(manUtd, manCity, brazil)
      .withCompetitions(epl)
      .withSeasons(epl2022
        .withTeams(manUtd, manCity)
      )
      .build();

    const season = gameData.seasons[0];
    const teamRepo = TeamRepositoryImpl.getInstance(ApiProvider.LIGI);
    const seasonTeams = await teamRepo.getAllBySeason$(season.id).toPromise();
    expect(seasonTeams).to.have.length(2);
  });
});
