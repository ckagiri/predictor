import 'mocha';
import { expect } from 'chai';

import UserModel from '../../db/models/user.model';

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
  });
});
