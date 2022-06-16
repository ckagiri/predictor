import { expect } from 'chai';

import { LeaderboardRepositoryImpl } from '../../db/repositories/leaderboard.repo';
import memoryDb from '../memoryDb';


describe('LeaderboardRepo', function () {
  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  it('should findOrCreate leaderboard', done => {
    //
  });
});
