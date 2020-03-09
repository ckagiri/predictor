import mongoose from 'mongoose';

export const isMongoId = (id: string) => id.match(/^[0-9a-fA-F]{24}$/);

export const toObjectId = (_id: string) =>
  mongoose.Types.ObjectId.createFromHexString(_id);
