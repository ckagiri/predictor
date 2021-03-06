import 'mocha';
import { expect } from 'chai';
import { flatMap } from 'rxjs/operators';

import db from '../../db';
import { CompetitionDocument } from '../../db/models/competition.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { SeasonRepositoryImpl } from '../../db/repositories/season.repo';

const epl = {
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'epl',
};

const epl17 = {
  id: undefined,
  name: '2017-2018',
  slug: '17-18',
  year: 2017,
  seasonStart: '2017-08-11T00:00:00+0200',
  seasonEnd: '2018-05-13T16:00:00+0200',
  currentMatchRound: 20,
  competitionId: undefined,
};

const epl16 = {
  id: undefined,
  name: '2016-2017',
  slug: '16-17',
  year: 2016,
  seasonStart: '2016-08-11T00:00:00+0200',
  seasonEnd: '2017-05-13T16:00:00+0200',
  currentMatchRound: 20,
};

const afdEpl17 = {
  id: 2021,
  name: 'Premier League',
  code: 'PL',
  currentSeason: {
    id: 445,
    startDate: '2018-08-10',
    endDate: '2019-05-12',
    currentMatchday: 34,
    winner: null,
  },
};

const afdEpl16 = {
  id: 2021,
  name: 'Premier League',
  code: 'PL',
  currentSeason: {
    id: 441,
    startDate: '2018-08-10',
    endDate: '2019-05-12',
    currentMatchday: 32,
    winner: null,
  },
};

let aCompetition: CompetitionDocument;

describe('seasonRepo', function() {
  this.timeout(5000);
  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
  });
  beforeEach(done => {
    db.Competition.create(epl).then(l => {
      aCompetition = l;
      done();
    });
  });
  afterEach(done => {
    db.drop().then(() => {
      done();
    });
  });
  after(done => {
    db.close().then(() => {
      done();
    });
  });

  it('should save new season', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(ApiProvider.LIGI);
    epl17.competitionId = aCompetition._id;
    seasonRepo.save$(epl17).subscribe(
      (data: any) => {
        const { competition, name, slug, year } = data;
        expect(name).to.equal(epl17.name);
        expect(slug).to.equal(epl17.slug);
        expect(year).to.equal(epl17.year);
        expect(competition.name).to.equal(epl.name);
        expect(competition.slug).to.equal(epl.slug);
        done();
      },
      err => {
        // tslint:disable-next-line: no-console
        console.log(err);
        done();
      },
    );
  });

  it('should find by externalId', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );
    const { _id, name, slug } = aCompetition;
    const theEpl17 = {
      ...epl17,
      competition: { id: _id, name, slug },
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: afdEpl17.id },
      },
    };

    seasonRepo
      .insert$(theEpl17)
      .pipe(
        flatMap(_ => {
          return seasonRepo.findByExternalId$(afdEpl17.id);
        }),
      )
      .subscribe(s => {
        expect(s.externalReference).to.deep.equal(theEpl17.externalReference);
        done();
      });
  });

  it('should find by externalIds', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );
    const { _id, name, slug } = aCompetition;
    const competition = { id: _id, name, slug };
    const theEpl17 = {
      ...epl17,
      competition,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: afdEpl17.id },
      },
    };
    const theEpl16 = {
      ...epl16,
      competition,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: afdEpl16.id },
      },
    };

    seasonRepo
      .insertMany$([theEpl16, theEpl17])
      .pipe(
        flatMap(_ => {
          return seasonRepo.findByExternalIds$([afdEpl16.id, afdEpl17.id]);
        }),
      )
      .subscribe(data => {
        expect(data[0].externalReference).to.deep.equal(
          theEpl16.externalReference,
        );
        expect(data[1].externalReference).to.deep.equal(
          theEpl17.externalReference,
        );
        done();
      });
  });

  it('should findByIdAndUpdate currentMatchRound', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(ApiProvider.LIGI);
    const epl17Data = { ...epl17, competitionId: aCompetition._id };

    seasonRepo
      .save$(epl17Data)
      .pipe(
        flatMap(s => {
          const update = { currentMatchRound: 21 };
          return seasonRepo.findByIdAndUpdate$(s.id!, update);
        }),
      )
      .subscribe(s => {
        expect(s.currentMatchRound).to.equal(21);
        done();
      });
  });

  it('should findByExternalIdAndUpdate currentMatchRound', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );
    const { _id, name, slug } = aCompetition;
    const competition = { id: _id, name, slug };
    const theEpl17 = {
      ...epl17,
      competition,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: afdEpl17.id },
      },
    };

    seasonRepo
      .insert$(theEpl17)
      .pipe(
        flatMap(() => {
          afdEpl17.currentSeason.currentMatchday = 21;
          return seasonRepo.findByExternalIdAndUpdate$(afdEpl17);
        }),
      )
      .subscribe(s => {
        expect(s.currentMatchRound).to.equal(21);
        done();
      });
  });

  it('should findByExternalIdAndUpdate currentMatchRound (version2)', done => {
    const seasonRepo = SeasonRepositoryImpl.getInstance(
      ApiProvider.API_FOOTBALL_DATA,
    );
    const { _id, name, slug } = aCompetition;
    const competition = { id: _id, name, slug };
    const theEpl17 = {
      ...epl17,
      competition,
      externalReference: {
        [ApiProvider.API_FOOTBALL_DATA]: { id: afdEpl17.id },
      },
    };

    seasonRepo
      .insert$(theEpl17)
      .pipe(
        flatMap(() => {
          const update = { currentMatchRound: 21 };
          return seasonRepo.findByExternalIdAndUpdate$(afdEpl17.id, update);
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
    const { _id, name, slug } = aCompetition;
    const competition = { id: _id, name, slug };
    const theEpl17 = {
      ...epl17,
      competition,
      externalReference: {
        ['SomeOtherApi']: { id: 'someExternalId' },
        [ApiProvider.API_FOOTBALL_DATA]: { id: afdEpl17.id },
      },
    };

    seasonRepo
      .insert$(theEpl17)
      .pipe(
        flatMap(() => {
          afdEpl17.currentSeason.currentMatchday = 21;
          return seasonRepo.findByExternalIdAndUpdate$(afdEpl17);
        }),
      )
      .subscribe(s => {
        expect(s.currentMatchRound).to.equal(21);
        expect(s.externalReference).to.deep.equal(theEpl17.externalReference);
        done();
      });
  });
});
