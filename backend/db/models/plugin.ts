import { Schema, Types } from 'mongoose';

export default function (schema: Schema, _options?: any) {
  schema.set('timestamps', true);
}
