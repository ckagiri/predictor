import 'mocha';
import { expect } from 'chai';

import TeamModel from '../../db/models/team.model';

describe('Team', () => {
  describe('schema', () => {
    describe('an empty team', () => {
      const t = new TeamModel();

      it('should have a mongoose schema', () => {
        expect(t.schema).to.not.be.undefined;
      });

      it('should require a name', async () => {
        try {
          await t.validate();
        } catch (err: any) {
          expect(err.errors.name).to.exist;
          return;
        }
        throw new Error('Validation should have failed but did not.');
      });

      it('should require a slug', async () => {
        try {
          await t.validate();
        } catch (err: any) {
          expect(err.errors.slug).to.exist;
          return;
        }
        throw new Error('Validation should have failed but did not.');
      });
    });

    describe('a team', () => {
      const team = {
        aliases: ['ManU', 'ManUtd'],
        code: 'MUN',
        crestUrl:
          'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
        name: 'Manchester United FC',
        shortName: 'Man United',
        slug: 'man_united',
      };
      const t = new TeamModel(team);
      it('should have 0 errors', async () => {
        await t.validate();
      });
    });
  });
});
