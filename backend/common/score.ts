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
  ExactGoalDifferencePoints: number;
  ExactMatchScorePoints: number;
  CloseMatchScorePoints: number;
  SpreadTeamScorePoints: number;
  ExactTeamScorePoints: number;
  [key: string]: number;
}

export interface Odds {
  homeWin: number;
  awayWin: number;
  draw: number;
}
