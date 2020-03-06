import { expect } from 'chai';

import UserModel from '../../db/models/user.model';
import { UserRepositoryImpl } from '../../db/repositories/user.repo';
import * as db from '../../db/index';

const userRepo = UserRepositoryImpl.getInstance();

describe('User Repo', function () {
  this.timeout(5000);
  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
  });
  beforeEach(done => {
    const user1 = new UserModel({
      username: 'chalo',
      email: 'chalo@example.com',
      local: { password: 'chalo' },
    });
    const user2 = {
      username: 'kagiri',
      email: 'kagiri@example.com',
    };
    Promise.all([user1.save(), UserModel.create(user2)]).then(() => done());
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
