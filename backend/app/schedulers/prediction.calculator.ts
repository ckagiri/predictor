import { Score, ScorePoints } from '../../common/score.js';

export class PredictionCalculator {
  public static getInstance() {
    return new PredictionCalculator();
  }

  public calculateScore(result: Score, choice: Score): ScorePoints {
    const points: ScorePoints = {
      closeMatchScorePoints: 0,
      correctMatchOutcomePoints: 0,
      correctTeamScorePoints: 0,
      exactGoalDifferencePoints: 0,
      exactMatchScorePoints: 0,
    };

    const choiceOutcome = outcome(choice.goalsHomeTeam, choice.goalsAwayTeam);
    const resultOutcome = outcome(result.goalsHomeTeam, result.goalsAwayTeam);
    const correctMatchOutcome = choiceOutcome === resultOutcome;
    const drawPrediction = choice.goalsHomeTeam === choice.goalsAwayTeam;
    const correctDrawOutcome = correctMatchOutcome && drawPrediction;
    const correctWinnerOutcome = correctMatchOutcome && !drawPrediction;
    const exactScore =
      choice.goalsHomeTeam === result.goalsHomeTeam &&
      choice.goalsAwayTeam === result.goalsAwayTeam;
    const exactGoalDiff = goalDiff(choice) === goalDiff(result);
    const oneGoalOffOverall = goalsOff(choice, result) === 1;
    const oneGoalOffBothTeams =
      goalsOffHomeTeam(choice, result) === 1 &&
      goalsOffAwayTeam(choice, result) === 1;
    const correctThreeOrMoreGoalDiff =
      (goalDiff(choice) >= 3 && goalDiff(result) >= 3) ||
      (goalDiff(choice) <= -3 && goalDiff(result) <= -3);

    if (correctMatchOutcome) {
      points.correctMatchOutcomePoints = 7;
    }

    if (exactGoalDiff) {
      points.exactGoalDifferencePoints = 1;
    }

    if (
      (correctDrawOutcome && oneGoalOffBothTeams) ||
      (correctWinnerOutcome && oneGoalOffOverall)
    ) {
      points.closeMatchScorePoints = 2;
    }

    if (
      (correctWinnerOutcome && oneGoalOffBothTeams) ||
      (!correctMatchOutcome && oneGoalOffOverall)
    ) {
      points.closeMatchScorePoints = 1;
    }

    if (choice.goalsHomeTeam === result.goalsHomeTeam) {
      points.correctTeamScorePoints += 1;
    }

    if (choice.goalsAwayTeam === result.goalsAwayTeam) {
      points.correctTeamScorePoints += 1;
    }

    if (correctThreeOrMoreGoalDiff && !oneGoalOffOverall && !exactScore) {
      points.correctTeamScorePoints += 1;
    }

    if (exactScore) {
      points.exactMatchScorePoints = 10;
    }

    return points;
  }
}

export default PredictionCalculator;

function goalDiff(score: Score): number {
  return score.goalsHomeTeam - score.goalsAwayTeam;
}

function goalsOff(choice: Score, result: Score): number {
  return goalsOffHomeTeam(choice, result) + goalsOffAwayTeam(choice, result);
}

function goalsOffAwayTeam(choice: Score, result: Score): number {
  return Math.abs(choice.goalsAwayTeam - result.goalsAwayTeam);
}

function goalsOffHomeTeam(choice: Score, result: Score): number {
  return Math.abs(choice.goalsHomeTeam - result.goalsHomeTeam);
}

function outcome(home: number, away: number): string {
  if (home > away) {
    return 'w';
  } else if (home < away) {
    return 'l';
  } else {
    return 'd';
  }
}
