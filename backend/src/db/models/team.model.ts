import { model, Schema } from 'mongoose';

import { Entity, schema } from './base.model.js';

export interface Team extends Entity {
  [key: string]: any;
  aliases?: string[];
  crestUrl?: string;
  externalReference?: any;
  name?: string;
  shortName?: string;
  slug?: string;
  tla?: string;
}

const { Mixed } = Schema.Types;

export const teamSchema = schema({
  aliases: { type: [String] },
  crestUrl: { type: String },
  externalReference: { type: Mixed },
  name: { required: true, trim: true, type: String },
  shortName: { trim: true, type: String },
  slug: { required: true, trim: true, type: String, unique: true },
  tla: { type: String },
});

const TeamModel = model<Team>('Team', teamSchema);

export default TeamModel;
