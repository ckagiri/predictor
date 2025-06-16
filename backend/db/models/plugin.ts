import { Schema, Types } from 'mongoose';

export default function (schema: Schema) {
  schema.set('timestamps', true);
  schema.virtual('id').get(function () {
    return (this._id as Types.ObjectId).toHexString();
  });
  schema.set('toObject', {
    transform: (doc: any, ret: Record<string, any>) => {
      if (ret._id) {
        ret.id = (ret._id as Types.ObjectId).toHexString();
      }
      delete ret.__v;
      return ret;
    },
    virtuals: true,
  });
}
