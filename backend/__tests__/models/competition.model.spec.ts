import 'mocha';
import { expect } from 'chai';
import { Competition } from '../../db/models/competition.model';

describe('Competition', () => {
  describe('schema', () => {
    describe('an empty competition', () => {
      const c = new Competition();

      it('should have a mongoose schema', () => {
        expect(c.schema).to.not.be.undefined;
      });

      it('should require a name', done => {
        c.validate(err => {
          expect(err.errors.name).to.exist;
          done();
        });
      });

      it('should require a slug', done => {
        c.validate(err => {
          expect(err.errors.slug).to.exist;
          done();
        });
      });

      it('should not require a code', done => {
        c.validate(err => {
          expect(err.errors.code).to.not.exist;
          done();
        });
      });
    });

    describe('a non-empty competition', () => {
      const competition = {
        name: 'English Premier League',
        slug: 'english_premier_league',
        code: 'epl',
      };
      const c = new Competition(competition);
      it('should have 0 errors', done => {
        c.validate(err => {
          expect(err).to.eql(null);
          done();
        });
      });
    });
  });
});
