import { expect } from 'chai';

import UserModel from '../../db/models/user.model';
import { UserRepositoryImpl } from '../../db/repositories/user.repo';
import memoryDb from '../memoryDb';

const userRepo = UserRepositoryImpl.getInstance();

describe('User Repo', function () {
  before(async () => {
    await memoryDb.connect();
  });

  beforeEach(async () => {
    const user1 = new UserModel({
      email: 'chalo@example.com',
      local: { password: 'chalo' },
      username: 'chalo',
    });

    const user2 = {
      email: 'kagiri@example.com',
      username: 'kagiri',
    };

    // user is a simple model, try different ways of saving user data to DB; internally these methods are used in the repo classes
    await Promise.all([user1.save(), UserModel.create(user2)]);
  });

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  after(async () => {
    await memoryDb.close();
  });

  it('should find all users', done => {
    userRepo.findAll$().subscribe(users => {
      expect(users).to.have.length(2);
      done();
    });
  });

  it('should filter users', done => {
    userRepo
      .find$({
        filter: { username: ['chalo'] },
      })
      .subscribe(({ count, result: users }) => {
        expect(users).to.have.length(1);
        expect(count).to.equal(1);
        done();
      });
  });
});
