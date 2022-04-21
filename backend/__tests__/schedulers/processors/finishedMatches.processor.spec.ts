// import * as sinon from 'sinon';
// import * as chai from 'chai';
// import sinonChai from 'sinon-chai';
// chai.use(sinonChai);
// const expect = chai.expect;
// import { of } from 'rxjs';
// import { Types } from 'mongoose';
// const ObjectId = Types.ObjectId;

// import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
// import { MatchStatus, Match } from '../../../db/models/match.model';
// import { PredictionStatus } from '../../../db/models/prediction.model';
// import {
//   FinishedMatchesProcessor,
//   FinishedMatchesProcessorImpl,
// } from '../../../app/schedulers/finishedMatches.processor';

// const newMatch = (
//   id: any,
//   homeTeamName: string,
//   awayTeamName: string,
//   status: string = MatchStatus.FINISHED,
// ) => {
//   return {
//     id: ObjectId().toHexString(),
//     season: '4edd40c86762e0fb12000001',
//     matchRound: 2,
//     slug: `${homeTeamName}V${awayTeamName}`,
//     homeTeam: { id: ObjectId().toHexString(), name: homeTeamName },
//     awayTeam: { id: ObjectId().toHexString(), name: awayTeamName },
//     status,
//     result: { goalsHomeTeam: 2, goalsAwayTeam: 1 },
//     allPredictionPointsUpdated: false,
//     externalReference: {
//       [ApiProvider.API_FOOTBALL_DATA]: { id },
//     },
//   } as Match;
// };
// const arsVche = newMatch(1, 'Arsenal', 'Chelsea');
// const livVsou = newMatch(2, 'Liverpool', 'Southampton');
// const eveVwat = newMatch(3, 'Everton', 'Watford', MatchStatus.IN_PLAY);
// const bouVwat = newMatch(4, 'Bournemouth', 'Watford');
// bouVwat.allPredictionPointsUpdated = true;
// const finishedMatches = [arsVche, livVsou, eveVwat, bouVwat];
// const chalo = ObjectId().toHexString();
// const kag = ObjectId().toHexString();
// const newPrediction = (
//   userId: string,
//   match: Match,
//   status = PredictionStatus.PENDING,
// ) => {
//   return {
//     user: userId,
//     match,
//     status,
//     choice: { goalsHomeTeam: 1, goalsAwayTeam: 1 },
//   };
// };
// const pred1 = newPrediction(chalo, arsVche);
// const pred2 = newPrediction(kag, arsVche, PredictionStatus.PROCESSED);
// const pred3 = newPrediction(chalo, livVsou);
// const pred4 = newPrediction(kag, livVsou);

// const predictionProcessorStub: any = {
//   getOrCreatePredictions$: sinon.stub(),
//   processPrediction$: sinon.stub(),
// };
// const matchRepoStub: any = {
//   findByIdAndUpdate$: () => {
//     return of({});
//   },
// };

// let finishedMatchesProcessor: FinishedMatchesProcessor;

// describe('Finished Matches', () => {
//   describe('processPredictions', () => {
//     beforeEach(() => {
//       predictionProcessorStub.getOrCreatePredictions$
//         .withArgs(sinon.match(arsVche))
//         .returns(of([pred1, pred2]));
//       predictionProcessorStub.getOrCreatePredictions$
//         .withArgs(sinon.match(livVsou))
//         .returns(of([pred3, pred4]));

//       predictionProcessorStub.processPrediction$.returns(of(pred1));
//       finishedMatchesProcessor = new FinishedMatchesProcessorImpl(
//         predictionProcessorStub,
//         matchRepoStub,
//       );
//     });
//     afterEach(() => {
//       predictionProcessorStub.getOrCreatePredictions$ = sinon.stub();
//       predictionProcessorStub.processPrediction$ = sinon.stub();
//     });
//     it('should getPredictions for FINISHED but not allPredictionPointsUpdated match', async () => {
//       const spy = predictionProcessorStub.getOrCreatePredictions$;

//       await finishedMatchesProcessor.processPredictions(finishedMatches);

//       expect(spy).to.have.been.calledTwice;
//     });

//     it('should process PENDING predictions', async () => {
//       const spy = predictionProcessorStub.processPrediction$;

//       await finishedMatchesProcessor.processPredictions(finishedMatches);

//       expect(spy).to.have.callCount(3);
//     });
//   });

//   describe('setToTrueallPredictionPointsUpdated', () => {});
// });
