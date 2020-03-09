import { Schema, Document, SchemaDefinition, SchemaOptions } from 'mongoose';
import Plugin from './plugin';

export interface Entity {
  id?: string;
}

export interface DocumentEntity extends Entity, Document {
  id?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export function schema(definition: SchemaDefinition, options?: SchemaOptions) {
  return new Schema(definition, options).plugin(Plugin);
}
