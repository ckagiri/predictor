import mongoose, { Model, HydratedDocument } from 'mongoose';
import { omit } from 'lodash';

import { Entity } from '../models/base.model';

const transform = (doc: any, ret: any) => {
  doc.id = doc._id.toString();
  delete doc._id; // TODO
  delete doc.__v;
  return doc;
};

export class DocumentDao<T extends Entity> {
  protected Model: Model<T>;

  constructor(SchemaModel: Model<T>) {
    this.Model = SchemaModel;
  }

  public save(obj: Entity): Promise<T> {
    let model: HydratedDocument<T>;
    if (obj instanceof this.Model) {
      model = obj as HydratedDocument<T>;
    } else {
      model = new this.Model(obj) as HydratedDocument<T>;
    }

    return model.save().then(model => model.toObject() as T);
  }

  public saveMany(objs: Entity[]): Promise<T[]> {
    return this.Model.create(objs).then(models => models.map(m => m.toObject()) as T[]);
  }

  public insert(obj: Entity): Promise<T> {
    return this.Model.create(obj).then(model => model.toObject() as T)
  }

  public insertMany(objs: Entity[]): Promise<T[]> {
    return this.Model.insertMany(objs).then(models => models.map(m => m.toObject()) as T[]);
  }

  public upsertMany(objs: Entity[]): Promise<any> {
    //Create bulk operations
    const ops = objs.map((obj: any) => {
      //Ensure item is a model, to allow inclusion of default values
      if (!(obj instanceof this.Model)) {
        obj = new this.Model(obj);
      }
      // Convert to plain object
      if (obj instanceof this.Model) {
        obj = obj.toObject({ depopulate: true });
      }

      // Can't have _id field when upserting item
      if (typeof obj._id !== 'undefined') {
        delete obj._id;
      }

      return {
        updateOne: {
          filter: { _id: obj.id },
          update: obj,
          upsert: true
        }
      }
    });
    return this.Model.bulkWrite(ops);
  }

  public updateMany(objs: Entity[]): Promise<any> {
    //Create bulk operations
    const ops = objs.map((obj: any) => {
      //Ensure item is a model, to allow inclusion of default values
      if (!(obj instanceof this.Model)) {
        obj = new this.Model(obj);
      }
      // Convert to plain object
      if (obj instanceof this.Model) {
        obj = obj.toObject({ depopulate: true, versionKey: false });
      }

      return {
        updateOne: {
          filter: { _id: obj.id },
          upsert: false,
          update: obj,
        }
      }
    });
    return this.Model.bulkWrite(ops);
  }

  public distinct(field: string, conditions: any = {}): Promise<string[]> {
    return this.Model.find(conditions).distinct(field).exec()
      .then((xs: any[]) => xs.map(x => x.toString()))
  }

  public findAll(
    conditions: any = {},
    projection?: any,
    options?: any,
  ): Promise<T[]> {
    return this.Model.find(conditions, projection, options)
      .lean({ transform })
      .then(res => Promise.resolve(res)) as Promise<T[]>;
   }

  public find(query: any = {}, projection?: any, options?: any) {
    const { filter, range, sort } = query;
    let conditions: any = {};
    if (filter) {
      const search = omit(filter, 'criteria');
      const { q } = search;
      if (q) {
        /* Search for case-insensitive match on any field: */
        const schema: any = this.Model.schema;
        const combinedOr = Object.keys(schema.paths)
          .filter(
            k =>
              schema.paths[k].instance === 'String' ||
              schema.paths[k].instance === 'ObjectID' ||
              schema.paths[k].instance === 'Number',
          )
          .map(k => {
            switch (schema.paths[k].instance) {
              case 'String':
                return {
                  [k]: new RegExp(q, 'i'),
                };
              case 'ObjectID':
                return mongoose.Types.ObjectId.isValid(q)
                  ? {
                    [k]: q,
                  }
                  : null;
              case 'Number':
                return !isNaN(parseInt(q, 10))
                  ? {
                    [k]: parseInt(q, 10),
                  }
                  : null;
            }
            return null;
          })
          .filter(condition => !!condition);
        if (combinedOr.length > 0) {
          conditions['$or'] = combinedOr;
        }
      } else {
        const combinedAnd = Object.keys(search).map(key => {
          const isId = key === 'id';
          const needle = search[key];
          if (Array.isArray(needle)) {
            return {
              [isId ? '_id' : key]: {
                $in: needle.map(n => (isId ? new mongoose.Types.ObjectId(n) : n)),
              },
            };
          }
          return {
            [isId ? '_id' : key]: isId
              ? new mongoose.Types.ObjectId(needle)
              : needle,
          };
        });

        const { criteria } = filter;
        if (criteria) {
          const andCriteria = Object.entries(criteria).map(([key, value]) => ({ [key]: value }));
          combinedAnd.push(...andCriteria);
        }

        if (combinedAnd.length > 0) {
          conditions['$and'] = combinedAnd;
        }
      }
    }
    return this.Model.countDocuments(conditions)
      .exec()
      .then(async count => {
        let query = this.Model.find(conditions, projection, options);
        if (sort) {
          const [field, order] = sort;
          query = query.sort({
            [options && options.primaryKey && field === 'id'
              ? options.primaryKey
              : field]: order === 'ASC' ? 1 : -1,
          });
        }
        if (range) {
          const [start, end] = range;
          query = query.skip(start).limit(end - start);
        }
        const result = await query.lean({ transform }).exec();
        return Promise.resolve({ result, count });
      }) as Promise<{ result: T[]; count: number }>;
  }

  public findOne(conditions: any, projection?: any) {
    return this.Model.findOne(conditions, projection).lean({ transform }).exec() as Promise<T>;
  }

  public findById(id: string) {
    return this.Model.findById(id).lean({ transform }).exec() as Promise<T>;
  }

  findAllByIds(ids: string[] = []): Promise<T[]> {
    return this.Model.find({ _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } })
      .lean({ transform })
      .then(res => Promise.resolve(res)) as Promise<T[]>;  }

  public findByIdAndUpdate(
    id: string,
    update: any,
    options: any = { overwrite: false, new: true },
  ): Promise<T> {
    return this.Model.findByIdAndUpdate(id, update, options).lean({ transform }).exec() as Promise<T | any>;
  }

  public findOneAndUpdate(
    conditions: any,
    update: any,
    options: any = { overwrite: false, new: true },
  ): Promise<T> {
    return this.Model.findOneAndUpdate(
      conditions,
      update,
      options,
    ).lean({ transform }).exec() as Promise<T | any>;
  }

  public findOneAndUpsert(
    conditions: any,
    update: any,
    options: any = { upsert: true, new: true, setDefaultsOnInsert: true },
  ) {
    return this.Model.findOneAndUpdate(
      conditions,
      update,
      options,
    ).lean({ transform }).exec() as Promise<T | any>;
  }

  public remove(id: string) {
    return this.Model.remove({ _id: new mongoose.Types.ObjectId(id) }).exec();
  }

  public count(conditions: any) {
    return this.Model.countDocuments(conditions).exec();
  }
}
