import 'mocha';
import { expect } from 'chai';

import MatchModel, { MatchStatus } from '../../db/models/match.model';

describe('Match', () => {
  describe('schema', () => {
    describe('an empty match', () => {
      const m = new MatchModel();

      it('should have a mongoose schema', () => {
        expect(m.schema).to.not.be.undefined;
      });

      it('should require a slug', done => {
        m.validate(err => {
          expect(err.errors.slug).to.exist;
          done();
        });
      });

      it('should require a date', done => {
        m.validate(err => {
          expect(err.errors.date).to.exist;
          done();
        });
      });

      it('should require gameRound', done => {
        m.validate(err => {
          expect(err.errors.gameRound).to.exist;
          done();
        });
      });

      it('should require a home team', done => {
        m.validate(err => {
          expect(err.errors['homeTeam.id']).to.exist;
          done();
        });
      });

      it('should require an away team', done => {
        m.validate(err => {
          expect(err.errors['awayTeam.id']).to.exist;
          done();
        });
      });

      it('should require status', done => {
        m.validate(err => {
          expect(err.errors.status).to.exist;
          done();
        });
      });
    });

    describe('a match', () => {
      const match = {
        season: '4edd40c86762e0fb12000001',
        date: '2018-05-13T14:00:00Z',
        status: MatchStatus.SCHEDULED,
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
      const m = new MatchModel(match);
      it('should have 0 errors', done => {
        m.validate(err => {
          expect(err).to.not.exist;
          done();
        });
      });
    });
  });
});
