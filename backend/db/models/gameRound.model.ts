import { Schema, model } from 'mongoose';
import { Entity, schema } from './base.model';

export interface GameRound extends Entity {
  season?: string;
  name: string;
  slug: string;
  position?: number;
}

const GameRoundSchema = schema({
  season: { type: Schema.Types.ObjectId, ref: 'Season', index: true, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, trim: true },
  position: { type: Number, required: true },
});

const GameRoundModel = model<GameRound>(
  'GameRound',
  GameRoundSchema,
);

export default GameRoundModel;
