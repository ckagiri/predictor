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
        APoints: 5,
        BPoints: 2,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 2,
        ExactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 1 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 7,
        APoints: 5,
        BPoints: 2,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 1 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 1,
        APoints: 0,
        BPoints: 1,
        CorrectMatchOutcomePoints: 0,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 4 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 4, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 8,
        APoints: 6,
        BPoints: 2,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 1,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 2,
        ExactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 4 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 4, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 6,
        APoints: 5,
        BPoints: 1,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 2 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 2, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 9,
        APoints: 5,
        BPoints: 4,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 1,
        SpreadTeamScorePoints: 2,
        ExactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 3 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 3, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 9,
        APoints: 5,
        BPoints: 4,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 1,
        SpreadTeamScorePoints: 2,
        ExactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 3 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 7,
        APoints: 5,
        BPoints: 2,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 3 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 15,
        APoints: 11,
        BPoints: 4,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 1,
        ExactMatchScorePoints: 5,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 2,
        ExactTeamScorePoints: 2,
      });
    });

    it('should be correct for choice 5 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 5, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 7,
        APoints: 6,
        BPoints: 1,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 1,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 0,
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
        points: 4,
        APoints: 0,
        BPoints: 4,
        CorrectMatchOutcomePoints: 0,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 1,
        SpreadTeamScorePoints: 2,
        ExactTeamScorePoints: 1,
      });
    });
    it('should be correct for choice 2 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 2, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 1,
        APoints: 0,
        BPoints: 1,
        CorrectMatchOutcomePoints: 0,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 0,
      });
    });
    it('should be correct for choice 3 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 3, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 2,
        APoints: 0,
        BPoints: 2,
        CorrectMatchOutcomePoints: 0,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 1,
      });
    });
    it('should be correct for choice 2 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 2, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 3,
        APoints: 0,
        BPoints: 3,
        CorrectMatchOutcomePoints: 0,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 1,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 1,
      });
    });
    it('should be correct for choice 2 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 2, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 7,
        APoints: 6,
        BPoints: 1,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 1,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 1,
        SpreadTeamScorePoints: 0,
        ExactTeamScorePoints: 0,
      });
    });
    it('should be correct for choice 1 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 15,
        APoints: 11,
        BPoints: 4,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 1,
        ExactMatchScorePoints: 5,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 2,
        ExactTeamScorePoints: 2,
      });
    });
    it('should be correct for choice 0 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 0, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 9,
        APoints: 6,
        BPoints: 3,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 1,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 1,
        SpreadTeamScorePoints: 2,
        ExactTeamScorePoints: 0,
      });
    });
    it('should be correct for choice 3 3', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 3, goalsAwayTeam: 3 },
      );
      expect(scorePoints).to.eql({
        points: 6,
        APoints: 6,
        BPoints: 0,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 1,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 0,
        ExactTeamScorePoints: 0,
      });
    });
  });

  describe('calculateScore for result: 1 0', () => {
    it('should be correct for choice 3 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 6,
        APoints: 6,
        BPoints: 0,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 1,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 0,
        ExactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 4 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 4, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 5,
        APoints: 5,
        BPoints: 0,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 0,
        ExactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 4 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 4, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 6,
        APoints: 5,
        BPoints: 1,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 3 3', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 3, goalsAwayTeam: 3 },
      );
      expect(scorePoints).to.eql({
        points: 0,
        APoints: 0,
        BPoints: 0,
        CorrectMatchOutcomePoints: 0,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 0,
        ExactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 0 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 0, goalsAwayTeam: 1 },
      );
      expect(scorePoints).to.eql({
        points: 2,
        APoints: 0,
        BPoints: 2,
        CorrectMatchOutcomePoints: 0,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 2,
        ExactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 0 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 0, goalsAwayTeam: 2 },
      );
      expect(scorePoints).to.eql({
        points: 1,
        APoints: 0,
        BPoints: 1,
        CorrectMatchOutcomePoints: 0,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 2 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        { goalsHomeTeam: 2, goalsAwayTeam: 0 },
      );
      expect(scorePoints).to.eql({
        points: 8,
        APoints: 5,
        BPoints: 3,
        CorrectMatchOutcomePoints: 5,
        ExactGoalDifferencePoints: 0,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 1,
        SpreadTeamScorePoints: 1,
        ExactTeamScorePoints: 1,
      });
    });
  });
});
