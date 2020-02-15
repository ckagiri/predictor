import 'mocha';
import { expect } from 'chai';
import { Team } from '../../db/models/team.model';

describe('Team', () => {
  describe('schema', () => {
    describe('an empty team', () => {
      const s = new Team();

      it('should have a mongoose schema', () => {
        expect(s.schema).to.not.be.undefined;
      });

      it('should require a name', done => {
        s.validate(err => {
          expect(err.errors.name).to.exist;
          done();
        });
      });

      it('should require a slug', done => {
        s.validate(err => {
          expect(err.errors.slug).to.exist;
          done();
        });
      });
    });

    describe('a team', () => {
      const team = {
        name: 'Manchester United FC',
        shortName: 'Man United',
        code: 'MUN',
        slug: 'man_united',
        crestUrl:
          'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
        aliases: ['ManU', 'ManUtd'],
      };
      const t = new Team(team);
      it('should have 0 errors', done => {
        t.validate(err => {
          expect(err).to.not.exist;
          done();
        });
      });
    });
  });
});
