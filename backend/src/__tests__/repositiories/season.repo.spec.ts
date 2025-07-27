import 'mocha';
import { expect } from 'chai';
import { lastValueFrom } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { Competition } from '../../db/models/competition.model';
import { Season } from '../../db/models/season.model';
import { SeasonRepositoryImpl } from '../../db/repositories/season.repo';
import a from '../a';
import memoryDb from '../memoryDb';

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
      code: 'PL',
      currentSeason: {
        currentMatchday: 34,
        endDate: '2022-05-12',
        id: 445,
        startDate: '2021-08-10',
        winner: null,
      },
      id: EPL_22_REF,
      name: 'Premier League',
    };

    // properly construct season with its competition prop to create$ not add$
    epl21 = {
      competition,
      currentMatchday: 20,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: EPL_21_REF },
      },
      id: 'abc123a',
      name: '2020-2021',
      seasonEnd: '2021-05-13T16:00:00+0200',
      seasonStart: '2020-08-11T00:00:00+0200',
      slug: '2020-21',
      year: 2022,
    };

    epl22 = {
      competition,
      currentMatchday: 20,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: EPL_22_REF },
      },
      id: 'abc123',
      name: '2021-2022',
      seasonEnd: '2022-05-13T16:00:00+0200',
      seasonStart: '2021-08-11T00:00:00+0200',
      slug: '2021-22',
      year: 2022,
    };
  });

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  it('should save new season', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(ApiProvider.LIGI);

    // competitionId is for LIGI season-repo; season-repo converter will find competition and construct season competition prop during add$
    const theEpl22 = {
      competitionId: epl.id,
      currentMatchday: 20,
      id: 'abc123',
      name: '2021-2022',
      seasonEnd: '2022-05-13T16:00:00+0200',
      seasonStart: '2021-08-11T00:00:00+0200',
      slug: '2021-22',
      year: 2022,
    };

    // add$ calls converter, create$ doesn't
    seasonRepo.add$(theEpl22).subscribe((data: any) => {
      const { competition, name, slug, year } = data;
      expect(name).to.equal(theEpl22.name);
      expect(slug).to.equal(theEpl22.slug);
      expect(year).to.equal(theEpl22.year);
      expect(competition.name).to.equal(epl.name);
      expect(competition.slug).to.equal(epl.slug);
      done();
    });
  });

  it('should find by externalId', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA
    );

    seasonRepo
      .create$(epl22)
      .pipe(
        mergeMap(_ => {
          return seasonRepo.findByExternalId$(EPL_22_REF);
        })
      )
      .subscribe(s => {
        expect(s?.externalReference).to.deep.equal(epl22.externalReference);
        done();
      });
  });

  // findByExternalIds is used in seasonScheduler and by seasonUpdater to update the currentMatchday.. the ids come from api client getCompetitions..
  // interesting that these competitions behave as seasons
  it('should find by externalIds', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA
    );

    seasonRepo
      .insertMany$([epl21, epl22])
      .pipe(
        mergeMap(_ => {
          return seasonRepo.findByExternalIds$([EPL_21_REF, EPL_22_REF]);
        })
      )
      .subscribe(data => {
        expect(data[0].externalReference).to.deep.equal(
          epl21.externalReference
        );
        expect(data[1].externalReference).to.deep.equal(
          epl22.externalReference
        );
        done();
      });
  });

  // need to see why we are so interested in current match round
  it('should findByIdAndUpdate to update currentMatchday', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(ApiProvider.LIGI);

    seasonRepo
      .create$(epl22)
      .pipe(
        mergeMap(s => {
          const update = { currentMatchday: 21 };
          return seasonRepo.findByIdAndUpdate$(s.id!, update);
        })
      )
      .subscribe(s => {
        expect(s?.currentMatchday).to.equal(21);
        done();
      });
  });

  it('should findByExternalIdAndUpdate to update currentMatchday', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA
    );

    seasonRepo
      .create$(epl22)
      .pipe(
        mergeMap(() => {
          afdEpl22.currentSeason.currentMatchday = 21;
          // we need to pass an afd season here -- there will be a converter to reformat the data
          return seasonRepo.findByExternalIdAndUpdate$(afdEpl22);
        })
      )
      .subscribe(s => {
        expect(s.currentMatchday).to.equal(21);
        done();
      });
  });

  it('should findByExternalIdAndUpdate to update currentMatchday using a patch', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA
    );

    seasonRepo
      .create$(epl22)
      .pipe(
        mergeMap(() => {
          const update = { currentMatchday: 21 };
          return seasonRepo.findByExternalIdAndUpdate$(EPL_22_REF, update);
        })
      )
      .subscribe(s => {
        expect(s.currentMatchday).to.equal(21);
        done();
      });
  });

  it('should findByExternalIdAndUpdate while preserving ExternalReference', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA
    );

    epl22 = {
      ...epl22,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: EPL_22_REF },
        ['SomeOtherApi']: { id: 'someExternalId' },
      },
    };

    seasonRepo
      .create$(epl22)
      .pipe(
        mergeMap(() => {
          afdEpl22.currentSeason.currentMatchday = 21;
          return seasonRepo.findByExternalIdAndUpdate$(afdEpl22);
        })
      )
      .subscribe(s => {
        expect(s.currentMatchday).to.equal(21);
        expect(s.externalReference).to.deep.equal(epl22.externalReference);
        done();
      });
  });
});
