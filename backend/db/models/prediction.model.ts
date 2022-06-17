import { Schema, model } from 'mongoose';

import { Entity, DocumentEntity, schema } from './base.model';
import { ScorePoints, Score } from '../../common/score';
export interface Prediction extends Entity {
  id?: string;
  user: string;
  season: string;
  match: string;
  matchSlug?: string;
  choice: Score;
  scorePoints?: ScorePoints;
  hasJoker?: boolean;
  jokerAutoPicked?: boolean;
}

export interface PredictionDocument extends Prediction, DocumentEntity { }

const { ObjectId } = Schema.Types;

const predictionSchema = schema({
  user: { type: ObjectId, ref: 'User', required: true, index: true },
  season: { type: ObjectId, ref: 'Season', required: true, index: true },
  match: { type: ObjectId, ref: 'Match', required: true, index: true },
  matchSlug: { type: String, trim: true },
  choice: {
    goalsHomeTeam: { type: Number },
    goalsAwayTeam: { type: Number },
    isComputerGenerated: { type: Boolean, default: true },
  },
  timestamp: { type: Schema.Types.Date, default: Date.now() },
  scorePoints: {
    points: { type: Number },
    ResultPoints: { type: Number },
    ScorePoints: { type: Number },
    CorrectMatchOutcomePoints: { type: Number },
    ExactGoalDifferencePoints: { type: Number },
    ExactMatchScorePoints: { type: Number },
    CloseMatchScorePoints: { type: Number },
    ExactTeamScorePoints: { type: Number },
  },
  hasJoker: { type: Boolean, default: false },
  jokerAutoPicked: { type: Boolean, default: false },
});

const PredictionModel = model<PredictionDocument>(
  'Prediction',
  predictionSchema,
);

export default PredictionModel;
