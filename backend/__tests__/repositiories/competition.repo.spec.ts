import { expect } from 'chai';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';
import memoryDb from '../memoryDb';

const competition = {
  id: '1',
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'epl',
};

describe('CompetitionRepo', function() {
  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  afterEach(async () => {
    await memoryDb.dropDb();
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
      }
    );
  });
});
