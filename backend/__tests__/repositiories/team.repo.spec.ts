import 'mocha';
import { expect } from 'chai';
import { mergeMap } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { TeamRepositoryImpl } from '../../db/repositories/team.repo';
import memoryDb from '../memoryDb';

const manUtd = {
  id: 'abc1',
  name: 'Manchester United',
  shortName: 'Man Utd',
  tla: 'MUN',
  slug: 'man-united',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
  aliases: ['ManU', 'ManUtd'],
};

const manCity = {
  id: 'abc2',
  name: 'Manchester City',
  shortName: 'Man City',
  tla: 'MCI',
  slug: 'man-city',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_City_FC.svg',
  aliases: ['ManCity'],
};

const afdManUtd = {
  id: 66,
  name: 'Manchester United FC',
  shortName: 'Man Utd',
  squadMarketValue: null,
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
};

const afdManCity = {
  id: 67,
  name: 'Manchester City FC',
  shortName: 'Man City',
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
        mergeMap(_ => {
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
        mergeMap(_ => {
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
        mergeMap(_ => {
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

    //todo: should sanitize patch object props
    teamRepo
      .insert$(manUtd)
      .pipe(
        mergeMap(_ => {
          return teamRepo.findByNameAndUpsert$(afdManUtd);
        }),
      )
      .subscribe(
        team => {
          expect(team.name).to.equal(manUtd.name);
          expect(team.shortName).to.equal(manUtd.shortName)
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
        mergeMap(_ => {
          return teamRepo.findByNameAndUpsert$(afdManUtd);
        }),
      )
      .subscribe(
        team => {
          expect(team.name).to.equal(teamManUtd.name);
          expect(team.shortName).to.equal(manUtd.shortName)
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
    const teamRepo = TeamRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA);

    teamRepo
      .insertMany$([manUtd, manCity])
      .pipe(
        mergeMap(_ => {
          return teamRepo.findEachByNameAndUpsert$([afdManUtd, afdManCity]);
        }),
      )
      .subscribe(
        teams => {
          expect(teams[0].name).to.equal(manUtd.name);
          expect(teams[0].shortName).to.equal(manUtd.shortName)
          expect(teams[0].shortName).to.equal(afdManUtd.shortName)

          expect(teams[1].name).to.equal(manCity.name);
          expect(teams[1].shortName).to.equal(manCity.shortName)
          expect(teams[1].shortName).to.equal(afdManCity.shortName)
          done();
        }
      );
  });
});
