import { Model, Document, Types, Query } from "mongoose";

import { IEntity } from '../models/base.model';

export class DocumentDao<T extends Document> {
  protected _model: Model<Document>;

  constructor(schemaModel: Model<Document>){
    this._model = schemaModel;
  }

  save(obj: IEntity): Promise<T> {
    const model = new this._model(obj) as T;
    return model.save();
  }

  saveMany(objs: IEntity[]): Promise<T[]> {
    return this._model.create(objs) as Promise<T[]>
  }

  insert(obj: IEntity): Promise<T> {
    return this._model.create(obj) as Promise<T>
  }

  insertMany(objs: IEntity[]): Promise<T[]> {
    return this._model.insertMany(objs) as Promise<T[]>
  }

  findAll(conditions: any = {}, projection?: any, options?: any): Promise<T[]> {
    return this._model.find(conditions, projection, options).exec() as Promise<T[]>;
  }

  findOne(conditions: any, projection?: any) {
		return this._model.findOne(conditions, projection).exec() as Promise<T>;
  }

  findById(id: string) {
    return this._model.findById(id).exec() as Promise<T>
  }

  findByIdAndUpdate(id: string, update: any, options: any = { overwrite: false, new: true }): Promise<T> {
    return this._model.findByIdAndUpdate(id, update, options).exec() as Promise<T>;
  }

  findOneAndUpdate(conditions: any, update: any, options: any = { overwrite: false, new: true }){
    return this._model.findOneAndUpdate(conditions, update, options).exec() as Promise<T>;
  }

  remove(id: string) {
		return this._model.remove({ _id: id }).exec();
	}

	count (conditions: any) {
		return this._model.count(conditions).exec();
	}
}