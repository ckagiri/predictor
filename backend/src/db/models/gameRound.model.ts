import { model, Schema } from 'mongoose';

import { Entity, schema } from './base.model.js';

export interface GameRound extends Entity {
  name: string;
  position?: number;
  season?: string;
  slug: string;
}

const GameRoundSchema = schema({
  name: { required: true, type: String },
  position: { required: true, type: Number },
  season: {
    index: true,
    ref: 'Season',
    required: true,
    type: Schema.Types.ObjectId,
  },
  slug: { required: true, trim: true, type: String },
});

const GameRoundModel = model<GameRound>('GameRound', GameRoundSchema);

export default GameRoundModel;
