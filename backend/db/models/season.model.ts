import { Schema, model } from 'mongoose';
import { Entity, schema } from './base.model';

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
  currentMatchday?: number;
  currentGameRound?: string;
  seasonStart?: any;
  seasonEnd?: any;
  externalReference?: any;
  teams?: string[];
}

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
  currentMatchday: { type: Number },
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
});

const SeasonModel = model<Season>('Season', seasonSchema);

export default SeasonModel;
