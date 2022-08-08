import 'mocha';
import { expect } from 'chai';
import * as bcrypt from 'bcryptjs';

import UserModel, { User } from '../../db/models/user.model';

describe('Users', () => {
  describe('schema', () => {
    describe('an empty user', () => {
      const u = new UserModel();
      it('should have 1 mandatory property', done => {
        u.validate((err: any) => {
          expect(Object.keys(err.errors)).to.have.lengthOf(1);
          done();
        });
      });

      it('should require an username', done => {
        u.validate((err: any) => {
          expect(err.errors.username).to.exist;
          done();
        });
      });
    });

    describe('comparePassword', () => {
      const salt = bcrypt.genSaltSync(10);

      const user: User = {
        username: 'Alpha',
      };

      it('should fail on comparePassword with empty pwd', done => {
        const u = new UserModel(user);

        u.validate((err: any) => {
          expect(err).to.eql(null);
          expect(u).to.have.property('local');
        });

        u.comparePassword!('test', (err: any, isMatch: any) => {
          expect(isMatch).to.be.undefined;
          expect(err).to.eql('Incorrect arguments');
          done();
        });
      });

      it('should fail on incorrectly salted stored pwd', done => {
        user.password = 'test';
        const u = new UserModel(user);

        u.validate((err: any) => {
          expect(err).to.eql(null);
          expect(u).to.have.property('local');
        });

        u.comparePassword!('test', (err: any, isMatch: any) => {
          expect(isMatch).to.be.undefined;
          expect(err).to.eql('Not a valid BCrypt hash.');
          done();
        });
      });

      it('should fail on comparePassword with wrong pwd', done => {
        user.password = bcrypt.hashSync('test', salt);
        const u = new UserModel(user);

        u.validate((err: any) => {
          expect(err).to.eql(null);
          expect(u).to.have.property('password');
          expect(u.password).to.have.property('password');
        });

        u.comparePassword!('test2', (err: any, isMatch: any) => {
          expect(isMatch).to.be.false;
          expect(err).to.be.null;
          done();
        });
      });

      it('should succeed on comparePassword with correct pwd', done => {
        user.password = bcrypt.hashSync('test', salt);
        const u = new UserModel(user);

        u.validate((err: any) => {
          expect(err).to.eql(null);
          expect(u).to.have.property('password');
        });

        u.comparePassword!('test', (err: any, isMatch: any) => {
          expect(isMatch).to.be.true;
          expect(err).to.be.null;
          done();
        });
      });
    });
  });
});
