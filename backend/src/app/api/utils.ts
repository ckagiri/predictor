import mongoose from 'mongoose';

export const isMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.exec(id);

export const toObjectId = (_id: string) =>
  mongoose.Types.ObjectId.createFromHexString(_id);
