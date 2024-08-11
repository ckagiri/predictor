import { Schema, model } from 'mongoose';

import { Entity, schema } from './base.model';

export interface UserScore extends Entity {
  id?: string;
  leaderboard: string;
  user: string;
  matches?: string[];
  matchesPredicted?: number;
  points: number;
  basePoints: number;
  correctMatchOutcomePoints: number;
  exactGoalDifferencePoints: number;
  closeMatchScorePoints: number;
  exactTeamScorePoints: number;
  exactMatchScorePoints: number;
  correctMatchOutcomes?: number;
  exactMatchScores?: number;
  exactGoalDiffs?: number;
  closeMatchScores?: number;
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
  matchesPredicted: { type: Number },
  points: { type: Number },
  basePoints: { type: Number },
  correctMatchOutcomePoints: { type: Number },
  exactGoalDifferencePoints: { type: Number },
  closeMatchScorePoints: { type: Number },
  exactMatchScorePoints: { type: Number },
  exactTeamScorePoints: { type: Number },
  correctMatchOutcomes: { type: Number },
  exactMatchScores: { type: Number },
  exactGoalDiffs: { type: Number },
  closeMatchScores: { type: Number },
  pointsOld: { type: Number },
  pointsNew: { type: Number },
  positionOld: { type: Number },
  positionNew: { type: Number },
});

const UserScoreModel = model<UserScore>('UserScore', userScoreSchema);

export default UserScoreModel;
