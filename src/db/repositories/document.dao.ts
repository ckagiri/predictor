import { Model, Document, Types, Query } from "mongoose";

import { IEntity } from '../models/base.model';

export class DocumentDao<T extends Document> {
  protected Model: Model<Document>;

  constructor(SchemaModel: Model<Document>){
    this.Model = SchemaModel;
  }

  save(obj: IEntity): Promise<T> {
    const model = new this.Model(obj) as T;
    return model.save();
  }

  saveMany(objs: IEntity[]): Promise<T[]> {
    return this.Model.create(objs) as Promise<T[]>
  }

  insert(obj: IEntity): Promise<T> {
    return this.Model.create(obj) as Promise<T>
  }

  insertMany(objs: IEntity[]): Promise<T[]> {
    return this.Model.insertMany(objs) as Promise<T[]>
  }

  findAll(conditions: any = {}, projection?: any, options?: any): Promise<T[]> {
    return this.Model.find(conditions, projection, options).exec() as Promise<T[]>;
  }

  findOne(conditions: any, projection?: any) {
		return this.Model.findOne(conditions, projection).exec() as Promise<T>;
  }

  findById(id: string) {
    return this.Model.findById(id).exec() as Promise<T>
  }

  findByIdAndUpdate(id: string, update: any, options: any = { overwrite: false, new: true }): Promise<T> {
    return this.Model.findByIdAndUpdate(id, update, options).exec() as Promise<T>;
  }

  findOneAndUpdate(conditions: any, update: any, options: any = { overwrite: false, new: true }){
    return this.Model.findOneAndUpdate(conditions, update, options).exec() as Promise<T>;
  }

  remove(id: string) {
		return this.Model.remove({ _id: id }).exec();
	}

	count (conditions: any) {
		return this.Model.count(conditions).exec();
	}
}