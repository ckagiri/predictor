import { Schema, model } from 'mongoose';
import { Entity, schema } from './base.model';

const { ObjectId } = Schema.Types;
export interface Competition extends Entity {
  name: string;
  slug: string;
  code?: string;
  currentSeason?: string;
}

const competitionSchema = schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, trim: true },
  code: { type: String, default: '' },
  currentSeason: { type: ObjectId, ref: 'Season' }
});

const CompetitionModel = model<Competition>(
  'Competition',
  competitionSchema,
);

export default CompetitionModel;
