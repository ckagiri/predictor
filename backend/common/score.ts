export interface Score {
  goalsHomeTeam: number;
  goalsAwayTeam: number;
  isComputerGenerated?: boolean;
}

export interface ScorePoints {
  points: number;
  APoints: number;
  BPoints: number;
  MatchOutcomePoints: number;
  TeamScorePlusPoints: number;
  ExactScorePoints: number;
  GoalDifferencePoints: number;
  TeamScoreMinusPoints: number;
}

export interface Odds {
  homeWin: number;
  awayWin: number;
  draw: number;
}
