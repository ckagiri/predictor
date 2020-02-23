import mongoose, { Model, Document } from 'mongoose';
mongoose.set('useFindAndModify', false);

import { Entity } from '../models/base.model';

export class DocumentDao<T extends Document> {
  protected Model: Model<Document>;

  constructor(SchemaModel: Model<Document>) {
    this.Model = SchemaModel;
  }

  public save(obj: Entity): Promise<T> {
    const model = new this.Model(obj) as T;
    return model.save();
  }

  public saveMany(objs: Entity[]): Promise<T[]> {
    return this.Model.create(objs) as Promise<T[]>;
  }

  public insert(obj: Entity): Promise<T> {
    return this.Model.create(obj) as Promise<T>;
  }

  public insertMany(objs: Entity[]): Promise<T[]> {
    return this.Model.insertMany(objs) as Promise<T[]>;
  }

  public findAll(
    conditions: any = {},
    projection?: any,
    options?: any,
  ): Promise<T[]> {
    return this.Model.find(conditions, projection, options).exec() as Promise<
      T[]
    >;
  }

  public findOne(conditions: any, projection?: any) {
    return this.Model.findOne(conditions, projection).exec() as Promise<T>;
  }

  public findById(id: string) {
    return this.Model.findById(id).exec() as Promise<T>;
  }

  public findByIdAndUpdate(
    id: string,
    update: any,
    options: any = { overwrite: false, new: true },
  ): Promise<T> {
    return this.Model.findByIdAndUpdate(id, update, options).exec() as Promise<
      T
    >;
  }

  public findOneAndUpdate(
    conditions: any,
    update: any,
    options: any = { overwrite: false, new: true },
  ) {
    return this.Model.findOneAndUpdate(
      conditions,
      update,
      options,
    ).exec() as Promise<T>;
  }

  public remove(id: string) {
    return this.Model.remove({ _id: id }).exec();
  }

  public count(conditions: any) {
    return this.Model.count(conditions).exec();
  }
}
