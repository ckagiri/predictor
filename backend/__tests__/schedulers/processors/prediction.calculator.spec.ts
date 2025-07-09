/* eslint-disable perfectionist/sort-objects */
import { expect } from 'chai';

import PredictionCalculator from '../../../app/schedulers/prediction.calculator';

const calculator = PredictionCalculator.getInstance();

describe('PredictionCalculator', () => {
  describe('calculateScore for result: 3 2', () => {
    it('should be correct for choice 2 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 2, goalsAwayTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 1 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 1, goalsAwayTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 1 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 1, goalsAwayTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 4 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 4, goalsAwayTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 4 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 4, goalsAwayTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 2,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 2 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 2, goalsAwayTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 3 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 3, goalsAwayTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 2,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 3 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 3, goalsAwayTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 2,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 10,
      });
    });

    it('should be correct for choice 3 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 3, goalsAwayTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 5 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 5, goalsAwayTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 4 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 4, goalsAwayTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 4 3', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 4, goalsAwayTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 3 3', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 3, goalsAwayTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 2 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 2, goalsAwayTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 1 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 1, goalsAwayTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 0 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 0, goalsAwayTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 0 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 0, goalsAwayTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 2 3', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 2, goalsAwayTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 3 4', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 2 },
        { goalsHomeTeam: 3, goalsAwayTeam: 4 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });
  });

  describe('calculateScore for result: 1 1', () => {
    it('should be correct for choice 1 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 1, goalsAwayTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 2 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 2, goalsAwayTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 3 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 3, goalsAwayTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 2 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 2, goalsAwayTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 0,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 2 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 2, goalsAwayTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 2,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
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
        correctTeamScorePoints: 2,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 10,
      });
    });

    it('should be correct for choice 0 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 0, goalsAwayTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 2,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 3 3', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 1, goalsAwayTeam: 1 },
        { goalsHomeTeam: 3, goalsAwayTeam: 3 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 0,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
      });
    });
  });

  describe('calculateScore for result: 3 0', () => {
    it('should be correct for choice 5 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 5, goalsAwayTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 2,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 4 0', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 4, goalsAwayTeam: 0 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 2,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 4 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 4, goalsAwayTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 1,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 5 1', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 5, goalsAwayTeam: 1 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 0,
        exactMatchScorePoints: 0,
      });
    });

    it('should be correct for choice 5 2', () => {
      const scorePoints = calculator.calculateScore(
        { goalsHomeTeam: 3, goalsAwayTeam: 0 },
        { goalsHomeTeam: 5, goalsAwayTeam: 2 }
      );
      expect(scorePoints).to.eql({
        closeMatchScorePoints: 0,
        correctMatchOutcomePoints: 7,
        correctTeamScorePoints: 1,
        exactGoalDifferencePoints: 1,
        exactMatchScorePoints: 0,
      });
    });
  });
});
