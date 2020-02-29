import mongoose, { Schema, model } from 'mongoose';
mongoose.set('useCreateIndex', true);

import { Entity, DocumentEntity } from './base.model';
import { ScorePoints, Score } from '../../common/score';

export enum PredictionStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
}

export interface PredictionModel extends Entity {
  id?: string;
  user: string;
  match: string;
  matchSlug?: string;
  season?: string;
  gameRound: number;
  choice: Score;
  scorePoints?: ScorePoints;
  status?: PredictionStatus;
  hasJoker?: boolean;
  jokerAutoPicked?: boolean;
}

export interface PredictionDocument extends PredictionModel, DocumentEntity {}

const { ObjectId } = Schema.Types;
const Status = PredictionStatus;

const predictionSchema = new Schema({
  user: { type: ObjectId, ref: 'User', required: true, index: true },
  match: { type: ObjectId, ref: 'Match', required: true, index: true },
  matchSlug: { type: String, trim: true },
  season: { type: ObjectId, ref: 'Season' },
  gameRound: { type: Number },
  choice: {
    goalsHomeTeam: { type: Number },
    goalsAwayTeam: { type: Number },
    isComputerGenerated: { type: Boolean, default: true },
  },
  timestamp: { type: Schema.Types.Date, default: Date.now() },
  scorePoints: {
    points: { type: Number },
    APoints: { type: Number },
    BPoints: { type: Number },
    CorrectMatchOutcomePoints: { type: Number },
    ExactGoalDifferencePoints: { type: Number },
    ExactMatchScorePoints: { type: Number },
    CloseMatchScorePoints: { type: Number },
    SpreadTeamScorePoints: { type: Number },
    ExactTeamScorePoints: { type: Number },
  },
  hasJoker: { type: Boolean, default: false },
  jokerAutoPicked: { type: Boolean, default: false },
  status: {
    type: String,
    enum: [Status.PENDING, Status.PROCESSED],
    default: Status.PENDING,
  },
});

export const Prediction = model<PredictionDocument>(
  'Prediction',
  predictionSchema,
);
