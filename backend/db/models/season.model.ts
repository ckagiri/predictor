import mongoose, { Schema, model } from 'mongoose';
mongoose.set('useCreateIndex', true);
import { Entity, DocumentEntity } from './base.model';

export interface SeasonEntity extends Entity {
  name?: string;
  year?: string | number;
  slug?: string;
  competition?: {
    name: string;
    slug: string;
    id: string;
  };
  numberOfRounds?: number;
  currentMatchRound?: number;
  currentGameRound?: number;
  seasonStart?: any;
  seasonEnd?: any;
  externalReference?: any;
}

export interface SeasonDocument extends SeasonEntity, DocumentEntity {}

const { ObjectId, Mixed } = Schema.Types;

export const seasonSchema = new Schema({
  competition: {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    id: { type: ObjectId, ref: 'Competition', index: true, required: true },
  },
  name: { type: String, required: true },
  slug: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  seasonStart: { type: Date, required: true },
  seasonEnd: { type: Date, required: true },
  currentMatchRound: { type: Number },
  currentGameRound: { type: Number },
  numberOfRounds: { type: Number },
  numberOfTeams: { type: Number },
  numberOfGames: { type: Number },
  externalReference: { type: Mixed },
});

export const Season = model<SeasonDocument>('Season', seasonSchema);
