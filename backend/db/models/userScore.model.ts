import mongoose, { Schema, model } from 'mongoose';
mongoose.set('useCreateIndex', true);

import { Entity, DocumentEntity } from './base.model';

export interface UserScoreEntity extends Entity {
  id?: string;
  leaderboard: string;
  user: string;
  matches?: string[];
  predictions?: string[];
  points: number;
  APoints: number;
  BPoints: number;
  MatchOutcomePoints: number;
  TeamScorePlusPoints: number;
  GoalDifferencePoints: number;
  ExactScorePoints: number;
  TeamScoreMinusPoints: number;
  APointsExcludingJoker?: number;
  BPointsExcludingJoker?: number;
  pointsExcludingJoker?: number;
  pointsOld?: number;
  pointsNew?: number;
  positionOld?: number;
  positionNew?: number;
}

export interface UserScoreDocument extends UserScoreEntity, DocumentEntity {}

const { ObjectId } = Schema.Types;

const userScoreSchema = new Schema({
  user: { type: ObjectId, ref: 'User', required: true, index: true },
  leaderboard: {
    type: ObjectId,
    ref: 'Leaderboard',
    required: true,
    index: true,
  },
  matches: [{ type: ObjectId, ref: 'Match' }],
  predictions: [{ type: ObjectId, ref: 'Prediction' }],
  points: { type: Number },
  APoints: { type: Number },
  BPoints: { type: Number },
  MatchOutcomePoints: { type: Number },
  TeamScorePlusPoints: { type: Number },
  GoalDifferencePoints: { type: Number },
  ExactScorePoints: { type: Number },
  TeamScoreMinusPoints: { type: Number },
  APointsExcludingJoker: { type: Number },
  BPointsExcludingJoker: { type: Number },
  pointsExcludingJoker: { type: Number },
  pointsOld: { type: Number },
  pointsNew: { type: Number },
  positionOld: { type: Number },
  positionNew: { type: Number },
});

export const UserScore = model<UserScoreDocument>('UserScore', userScoreSchema);
