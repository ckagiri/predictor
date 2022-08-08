import { Schema, model } from 'mongoose';

import { Entity, schema } from './base.model';

export interface Team extends Entity {
  name: string;
  slug?: string;
  shortName?: string;
  tla?: string;
  aliases?: string[];
  crestUrl?: string;
  externalReference?: any;
  [key: string]: any;
}

const { Mixed } = Schema.Types;

export const teamSchema = schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  shortName: { type: String, trim: true },
  tla: { type: String },
  aliases: { type: [String] },
  crestUrl: { type: String },
  externalReference: { type: Mixed },
});

const TeamModel = model<Team>('Team', teamSchema);

export default TeamModel;
