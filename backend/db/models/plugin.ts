import { Schema, Types } from 'mongoose';

export default function (schema: Schema, _options?: any) {
  schema.set('timestamps', true);
  schema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
    return this._id.toHexString();
  });
  schema.set("toJSON", {
    virtuals: true,
    transform: function (doc: any, ret: any, game: any) {
      delete ret._id;
      delete ret.__v;
    }
  });
  schema.set("toObject", {
    virtuals: true,
    transform: function (doc: any, ret: any, game: any) {
      delete ret._id;
      delete ret.__v;
    }
  });
  schema.post('find', attachId);
  schema.post('findOne', attachId);
  schema.post('findOneAndUpdate', attachId);
}

function attachId(res: any) {
  if (res == null) {
    return;
  }

  replaceId(res);

  function replaceId(res: any) {
    if (Array.isArray(res)) {
      res.forEach(v => {
        if (isObjectId(v)) {
          return;
        }
        if (v._id) {
          v.id = v._id.toString();
        }
        Object.keys(v).map(k => {
          if (Array.isArray(v[k])) {
            replaceId(v[k]);
          }
        });
      });
    } else {
      if (isObjectId(res)) {
        return res;
      }
      if (res._id) {
        res.id = res._id.toString();
      }
      Object.keys(res).map(k => {
        if (Array.isArray(res[k])) {
          replaceId(res[k]);
        }
      });
    }
  }
}

function isObjectId(v: any) {
  if (v == null) {
    return false;
  }
  const proto = Object.getPrototypeOf(v);
  if (
    proto == null ||
    proto.constructor == null ||
    proto.constructor.name !== 'ObjectID'
  ) {
    return false;
  }
  return v._bsontype === 'ObjectID';
}
