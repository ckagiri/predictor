import { Schema, Types } from 'mongoose';

export default function (schema: Schema, _options?: any) {
  schema.set('timestamps', true);
  schema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
    return this._id.toHexString();
  });
  schema.set('toObject', {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      ret.id = ret._id.toHexString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
}
