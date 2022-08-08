import 'mocha';
import { expect } from 'chai';
import { mergeMap } from 'rxjs/operators';

import { Competition } from '../../db/models/competition.model';
import { Season } from '../../db/models/season.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { SeasonRepositoryImpl } from '../../db/repositories/season.repo';
import memoryDb from '../memoryDb';
import a from '../a';
import { lastValueFrom } from 'rxjs';

let epl: Competition;
let epl21: Season;
let epl22: Season;
let afdEpl22: any; // Afd season representation

const EPL_21_REF = 'AFD_EPL_21';
const EPL_22_REF = 'AFD_EPL_22';

describe('seasonRepo', function () {
  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  beforeEach(async () => {
    epl = await a.competition
      .setName('English Premier League')
      .setSlug('english-premier-league')
      .setCode('epl')
      .build();

    const { id, name, slug } = epl;
    const competition = { id, name, slug } as Required<Competition>;

    afdEpl22 = {
      id: EPL_22_REF,
      name: 'Premier League',
      code: 'PL',
      currentSeason: {
        id: 445,
        startDate: '2021-08-10',
        endDate: '2022-05-12',
        currentMatchday: 34,
        winner: null,
      },
    };

    // properly construct season with its competition prop to insert$ not save$
    epl21 = {
      id: 'abc123a',
      name: '2020-2021',
      slug: '2020-21',
      year: 2022,
      seasonStart: '2020-08-11T00:00:00+0200',
      seasonEnd: '2021-05-13T16:00:00+0200',
      currentMatchRound: 20,
      competition,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: EPL_21_REF },
      },
    };

    epl22 = {
      id: 'abc123',
      name: '2021-2022',
      slug: '2021-22',
      year: 2022,
      seasonStart: '2021-08-11T00:00:00+0200',
      seasonEnd: '2022-05-13T16:00:00+0200',
      currentMatchRound: 20,
      competition,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: EPL_22_REF },
      },
    };
  })

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  it('should save new season', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(ApiProvider.LIGI);

    // competitionId is for LIGI season-repo; season-repo converter will find competition and construct season competition prop during save$
    const theEpl22 = {
      id: 'abc123',
      name: '2021-2022',
      slug: '2021-22',
      year: 2022,
      seasonStart: '2021-08-11T00:00:00+0200',
      seasonEnd: '2022-05-13T16:00:00+0200',
      currentMatchRound: 20,
      competitionId: epl.id,
    };

    // save$ calls converter, insert$ doesn't
    seasonRepo.save$(theEpl22).subscribe(
      (data: any) => {
        const { competition, name, slug, year } = data;
        expect(name).to.equal(theEpl22.name);
        expect(slug).to.equal(theEpl22.slug);
        expect(year).to.equal(theEpl22.year);
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

    seasonRepo
      .insert$(epl22)
      .pipe(
        mergeMap(_ => {
          return seasonRepo.findByExternalId$(EPL_22_REF);
        }),
      )
      .subscribe(s => {
        expect(s.externalReference).to.deep.equal(epl22.externalReference);
        done();
      });
  });

  // findByExternalIds is used in seasonScheduler and by seasonUpdater to update the currentMatchRound.. the ids come from api client getCompetitions..
  // interesting that these competitions behave as seasons
  it('should find by externalIds', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    seasonRepo
      .insertMany$([epl21, epl22])
      .pipe(
        mergeMap(_ => {
          return seasonRepo.findByExternalIds$([EPL_21_REF, EPL_22_REF]);
        }),
      )
      .subscribe(data => {
        expect(data[0].externalReference).to.deep.equal(
          epl21.externalReference,
        );
        expect(data[1].externalReference).to.deep.equal(
          epl22.externalReference,
        );
        done();
      });
  });

  // need to see why we are so interested in current match round
  it('should findByIdAndUpdate to update currentMatchRound', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(ApiProvider.LIGI);

    seasonRepo
      .insert$(epl22)
      .pipe(
        mergeMap(s => {
          const update = { currentMatchRound: 21 };
          return seasonRepo.findByIdAndUpdate$(s.id!, update);
        }),
      )
      .subscribe(s => {
        expect(s.currentMatchRound).to.equal(21);
        done();
      });
  });

  it('should findByExternalIdAndUpdate to update currentMatchRound', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    seasonRepo
      .insert$(epl22)
      .pipe(
        mergeMap(() => {
          afdEpl22.currentSeason.currentMatchday = 21;
          // we need to pass an afd season here -- there will be a converter to reformat the data
          return seasonRepo.findByExternalIdAndUpdate$(afdEpl22);
        }),
      )
      .subscribe(s => {
        expect(s.currentMatchRound).to.equal(21);
        done();
      });
  });

  it('should findByExternalIdAndUpdate to update currentMatchRound using a patch', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    seasonRepo
      .insert$(epl22)
      .pipe(
        mergeMap(() => {
          const update = { currentMatchRound: 21 };
          return seasonRepo.findByExternalIdAndUpdate$(EPL_22_REF, update);
        }),
      )
      .subscribe(s => {
        expect(s.currentMatchRound).to.equal(21);
        done();
      });
  });

  it('should findByExternalIdAndUpdate while preserving ExternalReference', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );

    epl22 = {
      ...epl22,
      externalReference: {
        ['SomeOtherApi']: { id: 'someExternalId' },
        [ApiProvider.API_FOOTBALL_DATA]: { id: EPL_22_REF },
      },
    };

    seasonRepo
      .insert$(epl22)
      .pipe(
        mergeMap(() => {
          afdEpl22.currentSeason.currentMatchday = 21;
          return seasonRepo.findByExternalIdAndUpdate$(afdEpl22);
        }),
      )
      .subscribe(s => {
        expect(s.currentMatchRound).to.equal(21);
        expect(s.externalReference).to.deep.equal(epl22.externalReference);
        done();
      });
  });
})
