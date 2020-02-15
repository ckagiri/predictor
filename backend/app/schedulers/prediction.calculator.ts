import { ScorePoints, Score } from '../../common/score';

export class PredictionCalculator {
  public static getInstance() {
    return new PredictionCalculator();
  }

  public calculateScore(result: Score, choice: Score): ScorePoints {
    const scorePoints: ScorePoints = {
      points: 0,
      APoints: 0,
      BPoints: 0,
      MatchOutcomePoints: 0,
      TeamScorePlusPoints: 0,
      GoalDifferencePoints: 0,
      ExactScorePoints: 0,
      TeamScoreMinusPoints: 0,
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
      scorePoints.MatchOutcomePoints = 4;
      scorePoints.APoints += 4;
    }
    if (choice.goalsHomeTeam === result.goalsHomeTeam) {
      scorePoints.TeamScorePlusPoints += result.goalsHomeTeam || 1;
      scorePoints.APoints += result.goalsHomeTeam || 1;
    }
    if (choice.goalsAwayTeam === result.goalsAwayTeam) {
      scorePoints.TeamScorePlusPoints += result.goalsAwayTeam || 1;
      scorePoints.APoints += result.goalsAwayTeam || 1;
    }

    const choiceGd = choice.goalsHomeTeam - choice.goalsAwayTeam;
    const resultGd = result.goalsHomeTeam - result.goalsAwayTeam;
    if (choiceGd === resultGd) {
      scorePoints.GoalDifferencePoints = 1;
      scorePoints.BPoints += 1;
    }
    if (
      choice.goalsHomeTeam === result.goalsHomeTeam &&
      choice.goalsAwayTeam === result.goalsAwayTeam
    ) {
      scorePoints.ExactScorePoints = 1;
      scorePoints.BPoints += 1;
    }
    const homeGoalsGd = Math.abs(choice.goalsHomeTeam - result.goalsHomeTeam);
    if (homeGoalsGd > 1) {
      scorePoints.TeamScoreMinusPoints -= 1;
      scorePoints.BPoints -= 1;
    }
    const awayGoalsGd = Math.abs(choice.goalsAwayTeam - result.goalsAwayTeam);
    if (awayGoalsGd > 1) {
      scorePoints.TeamScoreMinusPoints -= 1;
      scorePoints.BPoints -= 1;
    }
    scorePoints.points = scorePoints.APoints + scorePoints.BPoints;
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
