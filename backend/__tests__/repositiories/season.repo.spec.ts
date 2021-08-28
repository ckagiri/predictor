import 'mocha';
import { expect } from 'chai';
import { flatMap } from 'rxjs/operators';

import { Competition } from '../../db/models/competition.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { SeasonRepositoryImpl } from '../../db/repositories/season.repo';
import memoryDb from '../memoryDb';
import a from '../a';

let epl: Competition;

describe('seasonRepo', function() {
  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  beforeEach(async () => {
    epl = await a.competition
      .name('English Premier League')
      .slug('english-premier-league')
      .code('epl')
      .build();
  })

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  it('should save new season', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(ApiProvider.LIGI);

    // competitionId is for LIGI season-repo; season-repo converter will find competition and construct season competition prop
    const epl22 = {
      id: 'abc123',
      name: '2021-2022',
      slug: '2021-22',
      year: 2022,
      seasonStart: '2021-08-11T00:00:00+0200',
      seasonEnd: '2022-05-13T16:00:00+0200',
      currentMatchRound: 20,
      competitionId: epl.id,
    };

    // save$ calls converter from, insert$ doesn't
    seasonRepo.save$(epl22).subscribe(
      (data: any) => {
        const { competition, name, slug, year } = data;
        expect(name).to.equal(epl22.name);
        expect(slug).to.equal(epl22.slug);
        expect(year).to.equal(epl22.year);
        expect(competition.name).to.equal(epl.name);
        expect(competition.slug).to.equal(epl.slug);
        done();
      }
    );
  });

  it('should find by externalId', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );
    const EXTERNAL_REF_ID = 'AFD_EPL_22';
    const { id, name, slug } = epl;
    const competition = { id, name, slug };

    // for AFD season repo we work with a season that has a competition prop
    const theEpl22 = {
      id: 'abc123',
      name: '2021-2022',
      slug: '2021-22',
      year: 2022,
      seasonStart: '2021-08-11T00:00:00+0200',
      seasonEnd: '2022-05-13T16:00:00+0200',
      currentMatchRound: 20,
      competitionId: epl.id,
      competition,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: EXTERNAL_REF_ID },
      },
    };

    seasonRepo
      .insert$(theEpl22)
      .pipe(
        flatMap(_ => {
          return seasonRepo.findByExternalId$(EXTERNAL_REF_ID);
        }),
      )
      .subscribe(s => {
        expect(s.externalReference).to.deep.equal(theEpl22.externalReference);
        done();
      });
  });

  // findByExternalIds is used in seasonScheduler and by seasonUpdater to update the currentMatchRound.. the ids come from api client getCompetitions..
  // interesting that these competitions behave as seasons
  it('should find by externalIds', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );
    const { id, name, slug } = epl;
    const competition = { id, name, slug };

    const EPL_21_REF = 'AFD_EPL_21';
    const theEpl21 = {
      id: 'abc123a',
      name: '2020-2021',
      slug: '2020-21',
      year: 2022,
      seasonStart: '2020-08-11T00:00:00+0200',
      seasonEnd: '2021-05-13T16:00:00+0200',
      currentMatchRound: 20,
      competitionId: epl.id,
      competition,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: EPL_21_REF },
      },
    };

    const EPL_22_REF = 'AFD_EPL_22';
    const theEpl22 = {
      id: 'abc123b',
      name: '2021-2022',
      slug: '2021-22',
      year: 2022,
      seasonStart: '2021-08-11T00:00:00+0200',
      seasonEnd: '2022-05-13T16:00:00+0200',
      currentMatchRound: 20,
      competitionId: epl.id,
      competition,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: EPL_22_REF },
      },
    };

    seasonRepo
      .insertMany$([theEpl21, theEpl22])
      .pipe(
        flatMap(_ => {
          return seasonRepo.findByExternalIds$([EPL_21_REF, EPL_22_REF]);
        }),
      )
      .subscribe(data => {
        expect(data[0].externalReference).to.deep.equal(
          theEpl21.externalReference,
        );
        expect(data[1].externalReference).to.deep.equal(
          theEpl22.externalReference,
        );
        done();
      });
  });
})
