// import * as chai from 'chai';
// import sinonChai from 'sinon-chai';
// import chaiHttp = require('chai-http');
// import memoryDb from '../memoryDb';
// import a, { GameData } from '../a';
// import { setupReqRes } from './testUtils';
// import { GameController } from '../../app/api/game/game.controller';
// import { CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';
// import { MatchRepositoryImpl } from '../../db/repositories/match.repo';
// import { SeasonRepositoryImpl } from '../../db/repositories/season.repo';
// import { TeamRepositoryImpl } from '../../db/repositories/team.repo';

// chai.use(chaiHttp);
// chai.use(sinonChai);
// const expect = chai.expect;

// const liverpool = a.team.setName('Liverpool').setSlug('liverpool');
// const chelsea = a.team.setName('Chelsea').setSlug('chelsea');
// const manutd = a.team.setName('Manchester Utd').setSlug('man_utd');
// const arsenal = a.team.setName('Arsenal').setSlug('arsenal');
// const sunderland = a.team.setName('Sunderland').setSlug('sunderland');

// const epl = a.competition
//   .setName('English Premier League')
//   .setSlug('english-premier-league')
//   .setCode('epl');

// const gw1 = a.gameRound.setName('Gameweek 1').setSlug('gameweek-1').setPosition(1);
// const gw2 = a.gameRound.setName('Gameweek 2').setSlug('gameweek-2').setPosition(2);

// const epl2020 = a.season
//   .withCompetition(epl)
//   .setName('2019-2020')
//   .setSlug('2019-20')
//   .setYear(2020)
//   .setSeasonStart('2019-08-09T00:00:00+0200')
//   .setSeasonEnd('2020-05-17T16:00:00+0200');

// const chelseaFan = a.user.setUsername('chelseafan').setEmail('chelseafan@gmail.com');
// const liverpoolFan = a.user.setUsername('liverpoolfan').setEmail('liverpoolfan@gmail.com');

// async function setupSimpleGame() {
//   const game = await a.game
//     .withUsers(chelseaFan, liverpoolFan)
//     .withTeams(liverpool, arsenal, chelsea, manutd, sunderland)
//     .withCompetitions(epl)
//     .withSeasons(
//       epl2020
//         .withGameRounds(gw1, gw2)
//         .withTeams(liverpool, arsenal, chelsea, manutd).withMatches(
//           a.match
//             .withHomeTeam(chelsea)
//             .withAwayTeam(manutd)
//             .setDate('2020-02-10T11:30:00Z')
//             .withGameRound(gw1)
//             .withPredictions(
//               a.prediction
//                 .withUser(chelseaFan)
//                 .setHomeScore(3)
//                 .setAwayScore(0)
//                 .setJoker(true),
//               a.prediction
//                 .withUser(liverpoolFan)
//                 .setHomeScore(1)
//                 .setAwayScore(1),
//             ),
//           a.match
//             .withHomeTeam(liverpool)
//             .withAwayTeam(arsenal)
//             .setDate('2020-02-14T11:30:00Z')
//             .withGameRound(gw2)
//             .withPredictions(
//               a.prediction
//                 .withUser(chelseaFan)
//                 .setHomeScore(1)
//                 .setAwayScore(0),
//               a.prediction
//                 .withUser(liverpoolFan)
//                 .setHomeScore(2)
//                 .setAwayScore(0)
//                 .setJoker(true),
//             ),
//         ),
//     )
//     .build();
//   return game;
// }

// describe('Game Controller', function () {
//   before(async () => {
//     await memoryDb.connect();
//   });

//   after(async () => {
//     await memoryDb.close();
//   });

//   describe('get game data', function () {
//     let response: {
//       competitions?: any;
//       selectedCompetition?: any;
//       selectedSeason?: any;
//     };
//     before(async () => {
//       await memoryDb.dropDb();
//       await setupSimpleGame();
//       const gameController = new GameController(
//         CompetitionRepositoryImpl.getInstance(),
//         SeasonRepositoryImpl.getInstance(),
//         TeamRepositoryImpl.getInstance(),
//         MatchRepositoryImpl.getInstance(),
//       );
//       const { req, res } = setupReqRes();
//       await gameController.getGameData(<any>req, <any>res);
//       const firstCall = res.json.args[0];
//       response = firstCall[0];
//     });

//     it('should have competitions', () => {
//       const { competitions } = response;
//       expect(competitions).to.be.an.instanceof(Array);
//       expect(competitions).to.have.length(1);
//     });

//     it('should have a selected competition', () => {
//       const { selectedCompetition } = response;
//       expect(selectedCompetition).to.be.an('object');
//     });

//     it('should have a selected season', () => {
//       const { selectedSeason } = response;
//       expect(selectedSeason).to.be.an('object');
//     });

//     it('should have a current game round in selected season', () => {
//       const { selectedSeason } = response;
//       const currentGameRound = selectedSeason;
//       expect(currentGameRound).to.exist;
//     });

//     it('should have a selected season record', () => {
//       const { selectedSeason } = response;
//       const { record } = selectedSeason;
//       expect(record).to.be.an('object');
//     });

//     it('should have teams in selected season', () => {
//       const { selectedSeason } = response;
//       const { matches } = selectedSeason;
//       expect(matches).to.be.an.instanceof(Array);
//     });

//     it('should have matches in selected season', () => {
//       const { selectedSeason } = response;
//       const { matches } = selectedSeason;
//       expect(matches).to.be.an.instanceof(Array);
//     });
//   });
// });
