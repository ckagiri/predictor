import 'mocha';
import { expect } from 'chai';

import CompetitionModel from '../../db/models/competition.model';

describe('Competition', () => {
  describe('schema', () => {
    describe('an empty competition', () => {
      const c = new CompetitionModel();

      it('should have a mongoose schema', () => {
        expect(c.schema).to.not.be.undefined;
      });

      it('should require a name', done => {
        c.validate().catch((err: unknown) => {
          expect((err as any).errors.name).to.exist;
          done();
        });
      });

      it('should require a slug', done => {
        c.validate().catch((err: unknown) => {
          expect((err as any).errors.slug).to.exist;
          done();
        });
      });

      it('should not require a code', done => {
        c.validate().catch((err: unknown) => {
          expect((err as any).errors.code).to.not.exist;
          done();
        });
      });
    });

    describe('a non-empty competition', () => {
      const competition = {
        code: 'epl',
        name: 'English Premier League',
        slug: 'english_premier_league',
      };
      const c = new CompetitionModel(competition);
      it('should have 0 errors', done => {
        c.validate()
          .then(() => {
            expect(true).to.be.true;
            done();
          })
          .catch((err: unknown) => {
            done(err);
          });
      });
    });
  });
});
