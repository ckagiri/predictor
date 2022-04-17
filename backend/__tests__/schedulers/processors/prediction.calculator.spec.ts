// import { expect } from 'chai';
// import PredictionCalculator from '../../../app/schedulers/prediction.calculator';

// const calculator = PredictionCalculator.getInstance();

// describe('PredictionCalculator', () => {
//   describe('calculateScore for result: 3 0', () => {
//     it('should be correct for choice 2 1', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 2, goalsAwayTeam: 1 },
//       );
//       expect(scorePoints).to.eql({
//         points: 7,
//         APoints: 7,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });

//     it('should be correct for choice 1 0', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 1, goalsAwayTeam: 0 },
//       );
//       expect(scorePoints).to.eql({
//         points: 8,
//         APoints: 7,
//         BPoints: 1,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 1,
//       });
//     });

//     it('should be correct for choice 1 1', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 1, goalsAwayTeam: 1 },
//       );
//       expect(scorePoints).to.eql({
//         points: 0,
//         APoints: 0,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 0,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });

//     it('should be correct for choice 4 1', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 4, goalsAwayTeam: 1 },
//       );
//       expect(scorePoints).to.eql({
//         points: 8,
//         APoints: 8,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 1,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });

//     it('should be correct for choice 4 2', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 4, goalsAwayTeam: 2 },
//       );
//       expect(scorePoints).to.eql({
//         points: 7,
//         APoints: 7,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });

//     it('should be correct for choice 2 0', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 2, goalsAwayTeam: 0 },
//       );
//       expect(scorePoints).to.eql({
//         points: 9,
//         APoints: 7,
//         BPoints: 2,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 1,
//         ExactTeamScorePoints: 1,
//       });
//     });

//     it('should be correct for choice 3 1', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 3, goalsAwayTeam: 1 },
//       );
//       expect(scorePoints).to.eql({
//         points: 9,
//         APoints: 7,
//         BPoints: 2,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 1,
//         ExactTeamScorePoints: 1,
//       });
//     });

//     it('should be correct for choice 3 2', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 3, goalsAwayTeam: 2 },
//       );
//       expect(scorePoints).to.eql({
//         points: 8,
//         APoints: 7,
//         BPoints: 1,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 1,
//       });
//     });

//     it('should be correct for choice 3 0', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//       );
//       expect(scorePoints).to.eql({
//         points: 16,
//         APoints: 14,
//         BPoints: 2,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 1,
//         ExactMatchScorePoints: 6,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 2,
//       });
//     });

//     it('should be correct for choice 5 2', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 3, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 5, goalsAwayTeam: 2 },
//       );
//       expect(scorePoints).to.eql({
//         points: 8,
//         APoints: 8,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 1,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });
//   });

//   describe('calculateScore for result: 1 1', () => {
//     it('should be correct for choice 1 0', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 1 },
//         { goalsHomeTeam: 1, goalsAwayTeam: 0 },
//       );
//       expect(scorePoints).to.eql({
//         points: 2,
//         APoints: 0,
//         BPoints: 2,
//         CorrectMatchOutcomePoints: 0,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 1,
//         ExactTeamScorePoints: 1,
//       });
//     });
//     it('should be correct for choice 2 0', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 1 },
//         { goalsHomeTeam: 2, goalsAwayTeam: 0 },
//       );
//       expect(scorePoints).to.eql({
//         points: 0,
//         APoints: 0,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 0,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });
//     it('should be correct for choice 3 1', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 1 },
//         { goalsHomeTeam: 3, goalsAwayTeam: 1 },
//       );
//       expect(scorePoints).to.eql({
//         points: 1,
//         APoints: 0,
//         BPoints: 1,
//         CorrectMatchOutcomePoints: 0,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 1,
//       });
//     });
//     it('should be correct for choice 2 1', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 1 },
//         { goalsHomeTeam: 2, goalsAwayTeam: 1 },
//       );
//       expect(scorePoints).to.eql({
//         points: 2,
//         APoints: 0,
//         BPoints: 2,
//         CorrectMatchOutcomePoints: 0,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 1,
//         ExactTeamScorePoints: 1,
//       });
//     });
//     it('should be correct for choice 2 2', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 1 },
//         { goalsHomeTeam: 2, goalsAwayTeam: 2 },
//       );
//       expect(scorePoints).to.eql({
//         points: 8,
//         APoints: 8,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 1,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });
//     it('should be correct for choice 1 1', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 1 },
//         { goalsHomeTeam: 1, goalsAwayTeam: 1 },
//       );
//       expect(scorePoints).to.eql({
//         points: 16,
//         APoints: 14,
//         BPoints: 2,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 1,
//         ExactMatchScorePoints: 6,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 2,
//       });
//     });
//     it('should be correct for choice 0 0', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 1 },
//         { goalsHomeTeam: 0, goalsAwayTeam: 0 },
//       );
//       expect(scorePoints).to.eql({
//         points: 8,
//         APoints: 8,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 1,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });
//   });

//   describe('calculateScore for result: 1 0', () => {
//     it('should be correct for choice 2 1', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 2, goalsAwayTeam: 1 },
//       );
//       expect(scorePoints).to.eql({
//         points: 8,
//         APoints: 8,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 1,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });

//     it('should be correct for choice 2 0', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 2, goalsAwayTeam: 0 },
//       );
//       expect(scorePoints).to.eql({
//         points: 9,
//         APoints: 7,
//         BPoints: 2,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 1,
//         ExactTeamScorePoints: 1,
//       });
//     });

//     it('should be correct for choice 3 1', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 3, goalsAwayTeam: 1 },
//       );
//       expect(scorePoints).to.eql({
//         points: 7,
//         APoints: 7,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 7,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });

//     it('should be correct for choice 2 2', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 2, goalsAwayTeam: 2 },
//       );
//       expect(scorePoints).to.eql({
//         points: 0,
//         APoints: 0,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 0,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });

//     it('should be correct for choice 0 1', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 0, goalsAwayTeam: 1 },
//       );
//       expect(scorePoints).to.eql({
//         points: 0,
//         APoints: 0,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 0,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });

//     it('should be correct for choice 0 2', () => {
//       const scorePoints = calculator.calculateScore(
//         { goalsHomeTeam: 1, goalsAwayTeam: 0 },
//         { goalsHomeTeam: 0, goalsAwayTeam: 2 },
//       );
//       expect(scorePoints).to.eql({
//         points: 0,
//         APoints: 0,
//         BPoints: 0,
//         CorrectMatchOutcomePoints: 0,
//         ExactGoalDifferencePoints: 0,
//         ExactMatchScorePoints: 0,
//         CloseMatchScorePoints: 0,
//         ExactTeamScorePoints: 0,
//       });
//     });
//   });
// });
