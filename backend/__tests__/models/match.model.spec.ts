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

      it('should require a slug', async () => {
        const err: any = await m.validate().catch((e: unknown) => e);
        expect(err.errors.slug).to.exist;
      });

      it('should require a date', async () => {
        try {
          await m.validate();
        } catch (err: any) {
          expect(err.errors.utcDate).to.exist;
        }
      });

      it('should require gameRound', done => {
        m.validate().catch((err: unknown) => {
          expect((err as any).errors.gameRound).to.exist;
          done();
        });
      });

      it('should require a home team', done => {
        m.validate().catch((err: unknown) => {
          expect((err as any).errors['homeTeam.id']).to.exist;
          done();
        });
      });

      it('should require an away team', done => {
        m.validate().catch((err: unknown) => {
          expect((err as any).errors['awayTeam.id']).to.exist;
          done();
        });
      });

      it('should require status', done => {
        m.validate().catch((err: unknown) => {
          expect((err as any).errors.status).to.exist;
          done();
        });
      });
    });

    describe('a match', () => {
      const match = {
        awayTeam: {
          id: '4edd40c86762e0fb12000002',
          name: 'Chelsea',
          slug: 'chelsea',
        },
        gameRound: '4edd40c86762e0fb12000001',
        homeTeam: {
          id: '4edd40c86762e0fb12000001',
          name: 'Arsenal',
          slug: 'arsenal',
        },
        matchRound: 38,
        season: '4edd40c86762e0fb12000001',
        slug: 'arsenal-chelsea',
        status: MatchStatus.SCHEDULED,
        utcDate: '2018-05-13T14:00:00Z',
      };
      const m = new MatchModel(match);
      it('should have 0 errors', async () => {
        let err: unknown = null;
        try {
          await m.validate();
        } catch (e) {
          err = e;
        }
        expect(err).to.not.exist;
      });
    });
  });
});
