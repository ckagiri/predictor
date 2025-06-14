import 'mocha';
import * as bcrypt from 'bcryptjs';
import { expect } from 'chai';

import UserModel, { User } from '../../db/models/user.model';

describe('Users', () => {
  describe('schema', () => {
    describe('an empty user', () => {
      const u = new UserModel();

      it('should require an username', done => {
        u.validate()
          .then(() => {
            // Should not succeed validation
            done(new Error('Validation should have failed'));
          })
          .catch((err: unknown) => {
            expect((err as any).errors.username).to.exist;
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

        u.comparePassword!('test', (err: any, isMatch: any) => {
          expect(isMatch).to.be.false;
          done();
        });
      });

      it('should fail on incorrectly salted stored pwd', done => {
        user.password = 'test';
        const u = new UserModel(user);

        u.comparePassword!('test', (err: any, isMatch: any) => {
          expect(isMatch).to.be.false;
          done();
        });
      });

      it('should fail on comparePassword with wrong pwd', done => {
        user.password = bcrypt.hashSync('test', salt);
        const u = new UserModel(user);

        u.comparePassword!('test2', (err: any, isMatch: any) => {
          expect(isMatch).to.be.false;
          done();
        });
      });

      it('should succeed on comparePassword with correct pwd', done => {
        user.password = bcrypt.hashSync('test', salt);
        const u = new UserModel(user);

        u.comparePassword!('test', (err: any, isMatch: any) => {
          expect(isMatch).to.be.true;
          done();
        });
      });
    });
  });
});
