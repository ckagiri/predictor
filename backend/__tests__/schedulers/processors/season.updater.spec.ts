// import * as sinon from 'sinon';
// import * as chai from 'chai';
// import sinonChai from 'sinon-chai';
// chai.use(sinonChai);
// const expect = chai.expect;
// import { of } from 'rxjs';
// import { Types } from 'mongoose';
// const ObjectId = Types.ObjectId;

// import { SeasonUpdaterImpl } from '../../../app/schedulers/footballApi/season.updater';
// import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

// const provider = ApiProvider.API_FOOTBALL_DATA;
// const newApiSeason = () => {
//   return {
//     id: 1,
//     currentMatchRound: 2,
//   };
// };
// const newDbSeason = () => {
//   return {
//     id: ObjectId().toHexString(),
//     currentMatchRound: 1,
//     externalReference: { [provider]: { id: 1 } },
//   };
// };
// const dbSeason = newDbSeason();
// const apiSeason = newApiSeason();
// const dbSeasons = [dbSeason];
// const apiSeasons = [apiSeason];

// let seasonRepoStub: any;
// let seasonUpdater: SeasonUpdaterImpl;

// describe('SeasonUpdaterImpl', () => {
//   beforeEach(() => {
//     seasonRepoStub = {
//       FootballApiProvider: provider,
//       findByIdAndUpdate$: () => {
//         return of(dbSeason);
//       },
//       findByExternalIds$: () => {
//         return of(dbSeasons);
//       },
//     };
//     seasonUpdater = new SeasonUpdaterImpl(seasonRepoStub);
//   });

//   describe('updateCurrentMatchRound', () => {
//     it('should get seasons by externalId', async () => {
//       const spy = sinon.spy(seasonRepoStub, 'findByExternalIds$');

//       await seasonUpdater.updateCurrentMatchRound(apiSeasons);
//       const externalIds = [].map.call(apiSeasons, (n: any) => n.id);
//       expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith(
//         sinon.match(externalIds),
//       );
//     });

//     it('should update currentRound of season if different from stored', async () => {
//       const spy = sinon.spy(seasonRepoStub, 'findByIdAndUpdate$');

//       const res = await seasonUpdater.updateCurrentMatchRound(apiSeasons);

//       expect(spy).to.have.been.calledOnce;

//       expect(spy).to.have.been.calledWith(sinon.match(dbSeason.id));
//     });

//     it('should not update currentRound if similar', async () => {
//       const anApiSeason = newApiSeason();
//       anApiSeason.currentMatchRound = 1;
//       const spy = sinon.spy(seasonRepoStub, 'findByIdAndUpdate$');

//       await seasonUpdater.updateCurrentMatchRound([anApiSeason]);

//       expect(spy).not.to.have.been.called;
//     });
//   });
// });
