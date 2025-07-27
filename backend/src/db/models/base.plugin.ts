import { Schema, Types } from 'mongoose';

export default function (schema: Schema) {
  schema.set('timestamps', true);
  schema.virtual('id').get(function () {
    return (this._id as Types.ObjectId).toHexString();
  });
  schema.set('toObject', {
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      if (ret._id) {
        ret.id = (ret._id as Types.ObjectId).toHexString();
      }
      delete ret.__v;
      delete ret._id;
      return ret;
    },
    virtuals: true,
  });
}
