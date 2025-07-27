import 'mocha';
import { expect } from 'chai';

import SeasonModel from '../../db/models/season.model';

describe('Season', () => {
  describe('schema', () => {
    describe('an empty season', () => {
      const s = new SeasonModel();

      it('should have a mongoose schema', () => {
        expect(s.schema).to.not.be.undefined;
      });

      it('should require a name', async () => {
        try {
          await s.validate();
        } catch (err: any) {
          expect(err.errors.name).to.exist;
        }
      });

      it('should require a slug', async () => {
        try {
          await s.validate();
        } catch (err: any) {
          expect(err.errors.slug).to.exist;
        }
      });

      it('should require year', async () => {
        try {
          await s.validate();
        } catch (err: any) {
          expect(err.errors.year).to.exist;
        }
      });

      it('should require start date', async () => {
        try {
          await s.validate();
        } catch (err: any) {
          expect(err.errors.seasonStart).to.exist;
        }
      });

      it('should require end date', async () => {
        try {
          await s.validate();
        } catch (err: any) {
          expect(err.errors.seasonEnd).to.exist;
        }
      });

      it('should require partial competition info', async () => {
        try {
          await s.validate();
        } catch (err: unknown) {
          expect((err as any).errors['competition.id']).to.exist;
        }
      });
    });

    describe('a partial season', () => {
      const season = {
        competition: {
          id: '4edd40c86762e0fb12000003',
          name: 'English Premier League',
          slug: 'english_premier_league',
        },
        name: '2017-2018',
        seasonEnd: '2018-05-13T16:00:00+0200',
        seasonStart: '2017-08-11T00:00:00+0200',
        slug: '17-18',
        year: 2017,
      };
      const s = new SeasonModel(season);
      it('should have 0 errors', async () => {
        let err: any = null;
        try {
          await s.validate();
        } catch (e) {
          err = e;
        }
        expect(err).to.not.exist;
      });
    });
  });
});
