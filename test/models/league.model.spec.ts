import { expect } from 'chai';

import { League } from '../../src/db/models/league.model';

describe('League', () => {
  describe('schema', () => {

    describe('an empty league', () => {
      const l = new League();

      it('should have a mongoose schema', function(){
        expect(l.schema).to.not.be.undefined
      });

      it('should require a name', (done) => {
        l.validate((err) => {
          expect(err.errors.name).to.exist;
          done();
        })
      })

      it('should require a slug', (done) => {
        l.validate((err) => {
          expect(err.errors.slug).to.exist;
          done();
        })
      })

      it('should not require a code', (done) => {
        l.validate((err) => {
          expect(err.errors.code).to.not.exist;
          done();
        })
      });
    })

    describe('a non-empty league', () => {
      const league = {
        name: 'English Premier League',
        slug: 'english_premier_league',
        code: 'epl'
      };
      const l = new League(league);
      it('should have 0 errors', (done) => {
        l.validate((err) => {
          expect(err).to.eql(null);
          done();
        });
      });
    });
  })
})