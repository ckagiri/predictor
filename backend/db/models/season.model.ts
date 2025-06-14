import { model, Schema } from 'mongoose';

import { Entity, schema } from './base.model';
import { Team } from './team.model';

export interface Season extends Entity {
  competition?: {
    id: string;
    name: string;
    slug: string;
  };
  currentGameRound?: string;
  currentMatchday?: number;
  externalReference?: any;
  id: any;
  name?: string;
  numberOfRounds?: number;
  seasonEnd?: any;
  seasonStart?: any;
  slug?: string;
  teams?: string[] | Team[];
  year?: number;
}

const { Mixed, ObjectId } = Schema.Types;

export const seasonSchema = schema({
  competition: {
    id: { index: true, ref: 'Competition', required: true, type: ObjectId },
    name: { required: true, type: String },
    slug: { required: true, type: String },
  },
  currentGameRound: { ref: 'GameRound', type: ObjectId },
  currentMatchday: { type: Number },
  externalReference: { type: Mixed },
  name: { required: true, type: String },
  numberOfGames: { type: Number },
  numberOfRounds: { type: Number },
  numberOfTeams: { type: Number },
  seasonEnd: { required: true, type: Date },
  seasonStart: { required: true, type: Date },
  slug: { required: true, trim: true, type: String },
  teams: [
    {
      ref: 'Team',
      type: ObjectId,
    },
  ],
  year: { required: true, type: Number },
});

const SeasonModel = model<Season>('Season', seasonSchema);

export default SeasonModel;
