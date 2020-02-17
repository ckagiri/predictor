import { expect } from 'chai';

import { config } from '../../config/environment/index';
import * as db from '../../db/index';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { LeagueRepository } from '../../db/repositories/league.repo';

const league = {
  id: '1',
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'epl',
};

describe('LeagueRepo', function () {
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

  it('should save new league', done => {
    const leagueRepo = LeagueRepository.getInstance(ApiProvider.LIGI);

    leagueRepo.save$(league).subscribe(
      (data: any) => {
        const { name, slug, code } = data;
        expect(name).to.equal(league.name);
        expect(slug).to.equal(league.slug);
        expect(code).to.equal(league.code);
        done();
      },
      err => {
        // tslint:disable-next-line: no-console
        console.log(err);
        done();
      },
    );
  });
});
