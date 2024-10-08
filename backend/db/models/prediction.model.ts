import { Schema, model } from 'mongoose';

import { Entity, schema } from './base.model';
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
  [key: string]: any;
}

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
  scorePoints: {
    correctMatchOutcomePoints: { type: Number },
    exactGoalDifferencePoints: { type: Number },
    closeMatchScorePoints: { type: Number },
    exactTeamScorePoints: { type: Number },
    exactMatchScorePoints: { type: Number },
  },
  hasJoker: { type: Boolean, default: false },
  jokerAutoPicked: { type: Boolean, default: false },
});

const PredictionModel = model<Prediction>(
  'Prediction',
  predictionSchema,
);

export default PredictionModel;
