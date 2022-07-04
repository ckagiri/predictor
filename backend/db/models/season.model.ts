import { Schema, model } from 'mongoose';
import { Entity, DocumentEntity, schema } from './base.model';

export interface Season extends Entity {
  name?: string;
  year?: number;
  slug?: string;
  competition?: {
    name: string;
    slug: string;
    id: string;
  };
  numberOfRounds?: number;
  currentMatchRound?: number;
  currentGameRound?: string;
  seasonStart?: any;
  seasonEnd?: any;
  externalReference?: any;
  teams?: string[];
  isCurrent?: boolean;
}

export interface SeasonDocument extends Season, DocumentEntity { }

const { ObjectId, Mixed } = Schema.Types;

export const seasonSchema = schema({
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
  currentGameRound: { type: ObjectId, ref: 'GameRound' },
  numberOfRounds: { type: Number },
  numberOfTeams: { type: Number },
  numberOfGames: { type: Number },
  teams: [
    {
      type: ObjectId,
      ref: 'Team',
    },
  ],
  externalReference: { type: Mixed },
  isCurrent: { type: Boolean, default: false }
});

const SeasonModel = model<SeasonDocument>('Season', seasonSchema);

export default SeasonModel;
