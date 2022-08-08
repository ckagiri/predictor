import { Schema, SchemaDefinition, SchemaOptions } from 'mongoose';
import Plugin from './plugin';

export interface Entity {
  id?: string;
}

export function schema(definition: SchemaDefinition, options?: SchemaOptions) {
  return new Schema(definition, options).plugin(Plugin);
}
