import { expect } from 'chai';
import PredictionCalculator from '../../../app/schedulers/prediction.calculator';

const calculator = PredictionCalculator.getInstance();

describe('PredictionCalculator', () => {
  describe('calculateScore for result: 3 0', () => {
    it('should be correct for choice 2 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 2, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 7,
        resultPoints: 7,
        scorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 1 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 8,
        resultPoints: 7,
        scorePoints: 1,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 1,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 1 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 0,
        resultPoints: 0,
        scorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 4 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 4, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 8,
        resultPoints: 8,
        scorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 4 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 4, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 7,
        resultPoints: 7,
        scorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 2 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 2, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 9,
        resultPoints: 7,
        scorePoints: 2,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 1,
        exactTeamScorePoints: 1,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 3 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 3, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 9,
        resultPoints: 7,
        scorePoints: 2,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 1,
        exactTeamScorePoints: 1,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 3 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 8,
        resultPoints: 7,
        scorePoints: 1,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 1,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 3 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 16,
        resultPoints: 8,
        scorePoints: 8,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 2,
        exactMatchScorePoints: 6,
      });
    });

    it('should be correct for choice 5 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 5, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 8,
        resultPoints: 8,
        scorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });
  });

  describe('calculateScore for result: 1 1', () => {
    it('should be correct for choice 1 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 2,
        resultPoints: 0,
        scorePoints: 2,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 1,
        exactTeamScorePoints: 1,
        exactMatchScorePoints: 0,
      });
    });
    it('should be correct for choice 2 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 2, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 0,
        resultPoints: 0,
        scorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });
    it('should be correct for choice 3 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 3, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 1,
        resultPoints: 0,
        scorePoints: 1,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 1,
        exactMatchScorePoints: 0,
      });
    });
    it('should be correct for choice 2 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 2, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 2,
        resultPoints: 0,
        scorePoints: 2,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 1,
        exactTeamScorePoints: 1,
        exactMatchScorePoints: 0,
      });
    });
    it('should be correct for choice 2 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 2, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 8,
        resultPoints: 8,
        scorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });
    it('should be correct for choice 1 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 16,
        resultPoints: 8,
        scorePoints: 8,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 2,
        exactMatchScorePoints: 6,
      });
    });
    it('should be correct for choice 0 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 0, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 8,
        resultPoints: 8,
        scorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });
  });

  describe('calculateScore for result: 1 0', () => {
    it('should be correct for choice 2 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 2, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 8,
        resultPoints: 8,
        scorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 2 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 2, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 9,
        resultPoints: 7,
        scorePoints: 2,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 1,
        exactTeamScorePoints: 1,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 3 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 3, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 7,
        resultPoints: 7,
        scorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 2 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 2, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 0,
        resultPoints: 0,
        scorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 0 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 0, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 0,
        resultPoints: 0,
        scorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 0 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 0, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 0,
        resultPoints: 0,
        scorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        closeMatchScorePoints: 0,
        exactTeamScorePoints: 0,
        exactMatchScorePoints: 0,
      });
    });
  });
});
