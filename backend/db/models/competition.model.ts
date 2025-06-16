import { model, Schema } from 'mongoose';

import { Entity, schema } from './base.model.js';

const { Mixed, ObjectId } = Schema.Types;
export interface Competition extends Entity {
  code?: string;
  currentSeason?: string;
  externalReference?: any;
  name: string;
  slug: string;
}

const competitionSchema = schema({
  code: { default: '', type: String },
  currentSeason: { ref: 'Season', type: ObjectId },
  externalReference: { type: Mixed },
  name: { required: true, type: String },
  slug: { required: true, trim: true, type: String },
});

const CompetitionModel = model<Competition>('Competition', competitionSchema);

export default CompetitionModel;
