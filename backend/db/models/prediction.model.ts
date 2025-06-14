import { model, Schema } from 'mongoose';

import { Score, ScorePoints } from '../../common/score';
import { Entity, schema } from './base.model';

export interface Prediction extends Entity {
  [key: string]: any;
  choice: Score;
  hasJoker?: boolean;
  id?: string;
  jokerAutoPicked?: boolean;
  match: string;
  matchSlug?: string;
  scorePoints?: ScorePoints;
  season: string;
  user: string;
}

const { ObjectId } = Schema.Types;

const predictionSchema = schema({
  choice: {
    goalsAwayTeam: { type: Number },
    goalsHomeTeam: { type: Number },
    isComputerGenerated: { default: true, type: Boolean },
  },
  hasJoker: { default: false, type: Boolean },
  jokerAutoPicked: { default: false, type: Boolean },
  match: { index: true, ref: 'Match', required: true, type: ObjectId },
  matchSlug: { trim: true, type: String },
  scorePoints: {
    closeMatchScorePoints: { type: Number },
    correctMatchOutcomePoints: { type: Number },
    exactGoalDifferencePoints: { type: Number },
    exactMatchScorePoints: { type: Number },
    exactTeamScorePoints: { type: Number },
  },
  season: { index: true, ref: 'Season', required: true, type: ObjectId },
  user: { index: true, ref: 'User', required: true, type: ObjectId },
});

const PredictionModel = model<Prediction>('Prediction', predictionSchema);

export default PredictionModel;
