import 'mocha';
import { expect } from 'chai';
import { flatMap } from 'rxjs/operators';

import { config } from '../../config/environment/index';
import * as db from '../../db/index';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { TeamRepository } from '../../db/repositories/team.repo';

const manu = {
  id: undefined,
  name: 'Manchester United FC',
  shortName: 'Man United',
  code: 'MUN',
  slug: 'man_united',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
  aliases: ['ManU', 'ManUtd'],
};

const manc = {
  id: undefined,
  name: 'Manchester City FC',
  shortName: 'Man City',
  code: 'MCI',
  slug: 'man_city',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_City_FC.svg',
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

describe('teamRepo', function () {
  this.timeout(5000);
  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
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

  it('should save a new Team', done => {
    const teamRepo = TeamRepository.getInstance(ApiProvider.LIGI);

    teamRepo.save$(manu).subscribe(
      (t: any) => {
        expect(t.name).to.equal(manu.name);
        expect(t.slug).to.equal(manu.slug);
        expect(t.aliases).to.contain('ManU', 'ManUtd');
        expect(t.aliases).to.have.length(2);
        done();
      },
      err => {
        done();
      },
    );
  });

  it('should findByName using name', done => {
    const teamRepo = TeamRepository.getInstance(ApiProvider.API_FOOTBALL_DATA);

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
        err => {
          done();
        },
      );
  });

  it('should findByName using shortName', done => {
    const teamRepo = TeamRepository.getInstance(ApiProvider.API_FOOTBALL_DATA);

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
        err => {
          done();
        },
      );
  });

  it('should findByName using alias', done => {
    const teamRepo = TeamRepository.getInstance(ApiProvider.API_FOOTBALL_DATA);

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
        err => {
          done();
        },
      );
  });

  it('should findByNameAndUpsert', done => {
    const teamRepo = TeamRepository.getInstance(ApiProvider.API_FOOTBALL_DATA);

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
        err => {
          done();
        },
      );
  });

  it('should retain external reference when doing findByNameAndUpsert', done => {
    const teamRepo = TeamRepository.getInstance(ApiProvider.API_FOOTBALL_DATA);
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
        err => {
          done();
        },
      );
  });

  it('should findEachByNameAndUpert', done => {
    const teamRepo = TeamRepository.getInstance(ApiProvider.LIGI);

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
        err => {
          done();
        },
      );
  });
});
