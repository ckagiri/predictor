import { expect } from 'chai';

import * as db from '../../db/index';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';

const competition = {
  id: '1',
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'epl',
};

describe('CompetitionRepo', function() {
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

  it('should save new competition', done => {
    const competitionRepo = CompetitionRepositoryImpl.getInstance(
      ApiProvider.LIGI,
    );

    competitionRepo.save$(competition).subscribe(
      (data: any) => {
        const { name, slug, code } = data;
        expect(name).to.equal(competition.name);
        expect(slug).to.equal(competition.slug);
        expect(code).to.equal(competition.code);
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
