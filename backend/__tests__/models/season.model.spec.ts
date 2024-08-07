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

      it('should require a name', done => {
        s.validate((err: any) => {
          expect(err.errors.name).to.exist;
          done();
        });
      });

      it('should require a slug', done => {
        s.validate((err: any) => {
          expect(err.errors.slug).to.exist;
          done();
        });
      });

      it('should require year', done => {
        s.validate((err: any) => {
          expect(err.errors.year).to.exist;
          done();
        });
      });

      it('should require start date', done => {
        s.validate((err: any) => {
          expect(err.errors.seasonStart).to.exist;
          done();
        });
      });

      it('should require end date', done => {
        s.validate((err: any) => {
          expect(err.errors.seasonEnd).to.exist;
          done();
        });
      });

      it('should require partial competition info', done => {
        s.validate((err: any) => {
          expect(err.errors['competition.id']).to.exist;
          done();
        });
      });
    });

    describe('a partial season', () => {
      const season = {
        name: '2017-2018',
        slug: '17-18',
        year: 2017,
        competition: {
          name: 'English Premier League',
          slug: 'english_premier_league',
          id: '4edd40c86762e0fb12000003',
        },
        seasonStart: '2017-08-11T00:00:00+0200',
        seasonEnd: '2018-05-13T16:00:00+0200',
      };
      const s = new SeasonModel(season);
      it('should have 0 errors', done => {
        s.validate((err: any) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });
  });
});
