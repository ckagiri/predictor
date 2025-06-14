import { expect } from 'chai';

import PredictionCalculator from '../../../app/schedulers/prediction.calculator';

const calculator = PredictionCalculator.getInstance();

describe('PredictionCalculator', () => {
  describe('calculateScore for result: 3 2', () => {
    it('should be correct for choice 2 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 1, goalsHomeTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 1 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 0, goalsHomeTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 1 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 1, goalsHomeTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 4 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 1, goalsHomeTeam: 4 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 4 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 2, goalsHomeTeam: 4 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 2,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 2 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 0, goalsHomeTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 3 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 1, goalsHomeTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 2,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 3 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 2, goalsHomeTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 10,
        exactTeamScorePoints: 2,
      });
    });

    it('should be correct for choice 3 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 0, goalsHomeTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 5 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 2, goalsHomeTeam: 5 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 4 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 0, goalsHomeTeam: 4 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 4 3', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 3, goalsHomeTeam: 4 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 3 3', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 3, goalsHomeTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 2 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 2, goalsHomeTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 1 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 2, goalsHomeTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 0 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 1, goalsHomeTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 0 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 2, goalsHomeTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 2 3', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 3, goalsHomeTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 3 4', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 2, goalsHomeTeam: 3 },
        { goalsAwayTeam: 4, goalsHomeTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });
  });

  describe('calculateScore for result: 1 1', () => {
    it('should be correct for choice 1 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 1, goalsHomeTeam: 1 },
        { goalsAwayTeam: 0, goalsHomeTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 2 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 1, goalsHomeTeam: 1 },
        { goalsAwayTeam: 0, goalsHomeTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 3 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 1, goalsHomeTeam: 1 },
        { goalsAwayTeam: 1, goalsHomeTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 2 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 1, goalsHomeTeam: 1 },
        { goalsAwayTeam: 1, goalsHomeTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 1,
      });
    });

    it('should be correct for choice 2 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 1, goalsHomeTeam: 1 },
        { goalsAwayTeam: 2, goalsHomeTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 2,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 1 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 1, goalsHomeTeam: 1 },
        { goalsAwayTeam: 1, goalsHomeTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 10,
        exactTeamScorePoints: 2,
      });
    });

    it('should be correct for choice 0 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 1, goalsHomeTeam: 1 },
        { goalsAwayTeam: 0, goalsHomeTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 2,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });

    it('should be correct for choice 3 3', () => {
      const scorePoints = calculator.calculateScore(
        { goalsAwayTeam: 1, goalsHomeTeam: 1 },
        { goalsAwayTeam: 3, goalsHomeTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
        exactTeamScorePoints: 0,
      });
    });
  });
});
