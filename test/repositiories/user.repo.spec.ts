import { expect } from 'chai';

import { User } from '../../src/db/models/user.model';
import { UserRepository } from '../../src/db/repositories/user.repo';
import * as db from '../../src/db/index';
import { config } from '../../src/config/environment/index';

const userRepo = UserRepository.getInstance();

describe('User Repo', function() {
  this.timeout(5000);
  before(done => {
    db.init(config.testDb.uri, done, { drop: true });
  });
  beforeEach(done => {
    const user1 = new User({
      username: 'chalo',
      email: 'chalo@example.com',
      local: { password: 'chalo' }
    });
    const user2 = {
      username: 'kagiri',
      email: 'kagiri@example.com'
    };
    Promise.all([user1.save(), User.create(user2)]).then(() => done());
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

  it('should find all users', done => {
    userRepo.findAll$().subscribe(users => {
      expect(users).to.have.length(2);
      done();
    });
  });
});
