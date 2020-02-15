import 'mocha';
import { expect } from 'chai';

import { FixtureStatus, Fixture } from '../../db/models/fixture.model';

describe('Fixture', () => {
  describe('schema', () => {
    describe('an empty fixture', () => {
      const s = new Fixture();

      it('should have a mongoose schema', () => {
        expect(s.schema).to.not.be.undefined;
      });

      it('should require a slug', done => {
        s.validate(err => {
          expect(err.errors.slug).to.exist;
          done();
        });
      });

      it('should require a date', done => {
        s.validate(err => {
          expect(err.errors.date).to.exist;
          done();
        });
      });

      it('should require matchRound', done => {
        s.validate(err => {
          expect(err.errors.matchRound).to.exist;
          done();
        });
      });

      it('should require a home team', done => {
        s.validate(err => {
          expect(err.errors['homeTeam.id']).to.exist;
          done();
        });
      });

      it('should require an away team', done => {
        s.validate(err => {
          expect(err.errors['awayTeam.id']).to.exist;
          done();
        });
      });

      it('should require status', done => {
        s.validate(err => {
          expect(err.errors.status).to.exist;
          done();
        });
      });
    });

    describe('a fixture', () => {
      const fixture = {
        season: '4edd40c86762e0fb12000001',
        date: '2018-05-13T14:00:00Z',
        status: FixtureStatus.SCHEDULED,
        matchRound: 38,
        gameRound: 38,
        homeTeam: {
          id: '4edd40c86762e0fb12000001',
          name: 'Arsenal',
          slug: 'arsenal',
        },
        awayTeam: {
          id: '4edd40c86762e0fb12000002',
          name: 'Chelsea',
          slug: 'chelsea',
        },
        slug: 'arsenal-chelsea',
      };
      const f = new Fixture(fixture);
      it('should have 0 errors', done => {
        f.validate(err => {
          expect(err).to.not.exist;
          done();
        });
      });
    });
  });
});
