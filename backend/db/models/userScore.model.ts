import mongoose, { Schema, model } from 'mongoose';
mongoose.set('useCreateIndex', true);

import { Entity, DocumentEntity } from './base.model';

export interface UserScore extends Entity {
  id?: string;
  leaderboard: string;
  user: string;
  matches?: string[];
  predictions?: string[];
  points: number;
  APoints: number;
  BPoints: number;
  CorrectMatchOutcomePoints: number;
  ExactGoalDifferencePoints: number;
  ExactMatchScorePoints: number;
  CloseMatchScorePoints: number;
  SpreadTeamScorePoints: number;
  ExactTeamScorePoints: number;
  APointsExcludingJoker?: number;
  BPointsExcludingJoker?: number;
  pointsExcludingJoker?: number;
  pointsOld?: number;
  pointsNew?: number;
  positionOld?: number;
  positionNew?: number;
}

export interface UserScoreDocument extends UserScore, DocumentEntity { }

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
  CorrectMatchOutcomePoints: { type: Number },
  ExactGoalDifferencePoints: { type: Number },
  ExactMatchScorePoints: { type: Number },
  CloseMatchScorePoints: { type: Number },
  SpreadTeamScorePoints: { type: Number },
  ExactTeamScorePoints: { type: Number },
  APointsExcludingJoker: { type: Number },
  BPointsExcludingJoker: { type: Number },
  pointsExcludingJoker: { type: Number },
  pointsOld: { type: Number },
  pointsNew: { type: Number },
  positionOld: { type: Number },
  positionNew: { type: Number },
});

const UserScoreModel = model<UserScoreDocument>('UserScore', userScoreSchema);

export default UserScoreModel;
