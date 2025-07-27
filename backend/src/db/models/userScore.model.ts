import { model, Schema } from 'mongoose';

import { Entity, schema } from './base.model';

export interface UserScore extends Entity {
  basePoints: number;
  closeMatchScorePoints: number;
  closeMatchScores?: number;
  correctMatchOutcomePoints: number;
  correctMatchOutcomes?: number;
  correctTeamScorePoints: number;
  exactGoalDifferencePoints: number;
  exactGoalDiffs?: number;
  exactMatchScorePoints: number;
  exactMatchScores?: number;
  leaderboard: string;
  matches?: string[];
  matchesPredicted?: number;
  points: number;
  pointsNew?: number;
  pointsOld?: number;
  positionNew?: number;
  positionOld?: number;
  user: string;
}

const { ObjectId } = Schema.Types;

const userScoreSchema = schema({
  basePoints: { type: Number },
  closeMatchScorePoints: { type: Number },
  closeMatchScores: { type: Number },
  correctMatchOutcomePoints: { type: Number },
  correctMatchOutcomes: { type: Number },
  correctTeamScorePoints: { type: Number },
  exactGoalDifferencePoints: { type: Number },
  exactGoalDiffs: { type: Number },
  exactMatchScorePoints: { type: Number },
  exactMatchScores: { type: Number },
  leaderboard: {
    index: true,
    ref: 'Leaderboard',
    required: true,
    type: ObjectId,
  },
  matches: [{ ref: 'Match', type: ObjectId }],
  matchesPredicted: { type: Number },
  points: { type: Number },
  pointsNew: { type: Number },
  pointsOld: { type: Number },
  positionNew: { type: Number },
  positionOld: { type: Number },
  user: { index: true, ref: 'User', required: true, type: ObjectId },
});

const UserScoreModel = model<UserScore>('UserScore', userScoreSchema);

export default UserScoreModel;
