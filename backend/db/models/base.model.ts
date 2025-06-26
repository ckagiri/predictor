import { Schema, SchemaDefinition, SchemaOptions } from 'mongoose';

import Plugin from './base.plugin.js';

export interface Entity {
  id?: string;
}

export function schema(
  definition: SchemaDefinition<any>,
  options?: SchemaOptions<any>
) {
  return new Schema(definition, options).plugin(Plugin);
}
