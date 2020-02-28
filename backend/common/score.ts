export interface Score {
  goalsHomeTeam: number;
  goalsAwayTeam: number;
  isComputerGenerated?: boolean;
}

export interface ScorePoints {
  points: number;
  APoints: number;
  BPoints: number;
  CorrectMatchOutcomePoints: number;
  ExactTeamScorePoints: number;
  ExactMatchScorePoints: number;
  ExactGoalDifferencePoints: number;
  SpreadTeamScorePoints: number;
}

export interface Odds {
  homeWin: number;
  awayWin: number;
  draw: number;
}
