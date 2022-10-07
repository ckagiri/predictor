import { Schema, model } from 'mongoose';

import { Entity, schema } from './base.model';

export interface UserScore extends Entity {
  id?: string;
  leaderboard: string;
  user: string;
  matches?: string[];
  predictions?: string[];
  matchesPredicted?: number;
  points: number;
  resultPoints: number;
  scorePoints: number;
  correctMatchOutcomePoints: number;
  exactGoalDifferencePoints: number;
  closeMatchScorePoints: number;
  exactTeamScorePoints: number;
  exactMatchScorePoints: number;
  correctMatchOutcomes?: number;
  closeMatchScores?: number;
  closeMatchScoresHigh?: number;
  closeMatchScoresLow?: number;
  exactMatchScores?: number;
  pointsExcludingJoker?: number;
  pointsOld?: number;
  pointsNew?: number;
  positionOld?: number;
  positionNew?: number;
}

const { ObjectId } = Schema.Types;

const userScoreSchema = schema({
  user: { type: ObjectId, ref: 'User', required: true, index: true },
  leaderboard: {
    type: ObjectId,
    ref: 'Leaderboard',
    required: true,
    index: true,
  },
  matches: [{ type: ObjectId, ref: 'Match' }],
  predictions: [{ type: ObjectId, ref: 'Prediction' }],
  matchesPredicted: { type: Number },
  points: { type: Number },
  resultPoints: { type: Number },
  scorePoints: { type: Number },
  correctMatchOutcomePoints: { type: Number },
  exactGoalDifferencePoints: { type: Number },
  closeMatchScorePoints: { type: Number },
  exactMatchScorePoints: { type: Number },
  exactTeamScorePoints: { type: Number },
  correctMatchOutcomes: { type: Number },
  closeMatchScores: { type: Number },
  closeMatchScoresHigh: { type: Number },
  closeMatchScoresLow: { type: Number },
  exactMatchScores: { type: Number },
  pointsExcludingJoker: { type: Number },
  pointsOld: { type: Number },
  pointsNew: { type: Number },
  positionOld: { type: Number },
  positionNew: { type: Number },
});

const UserScoreModel = model<UserScore>('UserScore', userScoreSchema);

export default UserScoreModel;
