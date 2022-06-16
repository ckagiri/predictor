import { ScorePoints, Score } from '../../common/score';

export class PredictionCalculator {
  public static getInstance() {
    return new PredictionCalculator();
  }

  public calculateScore(result: Score, choice: Score): ScorePoints {
    const scorePoints: ScorePoints = {
      points: 0,
      ResultPoints: 0,
      ScorePoints: 0,
      CorrectMatchOutcomePoints: 0,
      ExactGoalDifferencePoints: 0,
      ExactMatchScorePoints: 0,
      CloseMatchScorePoints: 0,
      ExactTeamScorePoints: 0,
    };
    const choiceOutcome = calcOutcome(
      choice.goalsHomeTeam,
      choice.goalsAwayTeam,
    );
    const resultOutcome = calcOutcome(
      result.goalsHomeTeam,
      result.goalsAwayTeam,
    );
    if (choiceOutcome === resultOutcome) {
      scorePoints.CorrectMatchOutcomePoints = 7;
      scorePoints.ResultPoints += 7;
    }

    const choiceGd = choice.goalsHomeTeam - choice.goalsAwayTeam;
    const resultGd = result.goalsHomeTeam - result.goalsAwayTeam;
    if (choiceGd === resultGd) {
      scorePoints.ExactGoalDifferencePoints = 1;
      scorePoints.ResultPoints += 1;
    }

    if (
      choice.goalsHomeTeam === result.goalsHomeTeam &&
      choice.goalsAwayTeam === result.goalsAwayTeam
    ) {
      scorePoints.ExactMatchScorePoints = 6;
      scorePoints.ScorePoints += 6;
    }

    const homeGoalsGd = Math.abs(choice.goalsHomeTeam - result.goalsHomeTeam);
    const awayGoalsGd = Math.abs(choice.goalsAwayTeam - result.goalsAwayTeam);
    if (homeGoalsGd === 0 || awayGoalsGd === 0) {
      if (homeGoalsGd === 1 || awayGoalsGd === 1) {
        scorePoints.CloseMatchScorePoints = 1;
        scorePoints.ScorePoints += 1;
      }
    }

    if (choice.goalsHomeTeam === result.goalsHomeTeam) {
      scorePoints.ExactTeamScorePoints += 1;
      scorePoints.ScorePoints += 1;
    }

    if (choice.goalsAwayTeam === result.goalsAwayTeam) {
      scorePoints.ExactTeamScorePoints += 1;
      scorePoints.ScorePoints += 1;
    }

    scorePoints.points = scorePoints.ResultPoints + scorePoints.ScorePoints;
    return scorePoints;
  }
}

export default PredictionCalculator;

function calcOutcome(home: number, away: number): string {
  if (home > away) {
    return 'w';
  } else if (home < away) {
    return 'l';
  } else {
    return 'd';
  }
}
