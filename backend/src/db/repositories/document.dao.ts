// Use the mongodb types from mongoose's dependency to avoid type conflicts
import type { BulkWriteResult } from 'mongoose/node_modules/mongodb';

import { merge } from 'lodash';
import {
  FilterQuery,
  Model,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  Types,
  UpdateQuery,
} from 'mongoose';

import { Entity } from '../models/base.model.js';
import { DatabaseOptions, FindQuery } from './interfaces.js';

const transform = (doc: any, ret: any) => {
  doc.id = doc._id.toString();
  delete doc._id;
  delete doc.__v;
  return doc;
};

export class DocumentDao<T extends Entity> {
  protected Model: Model<T>;

  constructor(SchemaModel: Model<T>) {
    this.Model = SchemaModel;
  }

  count(conditions?: RootFilterQuery<T>): Promise<number> {
    return this.Model.countDocuments(conditions).exec();
  }

  distinct(
    field: string,
    conditions: RootFilterQuery<T> = {}
  ): Promise<string[]> {
    return this.Model.find(conditions).distinct(field).exec() as Promise<
      string[]
    >;
  }

  exists(conditions: RootFilterQuery<T> = {}): Promise<boolean> {
    return this.Model.exists(conditions)
      .exec()
      .then(exists => !!exists);
  }

  find(
    query: FindQuery,
    options?: DatabaseOptions
  ): Promise<{ count: number; result: T[] }> {
    const { filter, range, sort } = query;
    const conditions: RootFilterQuery<T> = {};
    if (filter) {
      const { q } = filter;
      if (q) {
        /* Search for case-insensitive match on any field: */
        const schema = this.Model.schema;
        const combinedOr = Object.keys(schema.paths)
          .filter(
            k =>
              schema.paths[k].instance === 'String' ||
              schema.paths[k].instance === 'ObjectID' ||
              schema.paths[k].instance === 'Number'
          )
          .map(k => {
            switch (schema.paths[k].instance) {
              case 'Number':
                return !isNaN(parseInt(q, 10))
                  ? {
                      [k]: parseInt(q, 10),
                    }
                  : null;
              case 'ObjectID':
                return Types.ObjectId.isValid(q)
                  ? {
                      [k]: q,
                    }
                  : null;
              case 'String':
                return {
                  [k]: new RegExp(q, 'i'),
                };
            }
            return null;
          })
          .filter(condition => !!condition);
        if (combinedOr.length > 0) {
          conditions.$or = combinedOr as FilterQuery<T>[];
        }
      } else {
        const combinedAnd = Object.keys(filter).map(key => {
          const isId = key === 'id';
          const needle = filter[key];
          if (key === '$or') {
            return {
              $or: needle,
            };
          } else if (Array.isArray(needle)) {
            return {
              [isId ? '_id' : key]: {
                $in: needle.map(n =>
                  isId ? Types.ObjectId.createFromHexString(n) : n
                ),
              },
            };
          }
          return {
            [isId ? '_id' : key]: isId
              ? Types.ObjectId.createFromHexString(needle)
              : needle,
          };
        });
        if (combinedAnd.length > 0) {
          conditions.$and = combinedAnd;
        }
      }
    }
    return this.Model.countDocuments(conditions)
      .exec()
      .then(async count => {
        let repository = this.Model.find(conditions);
        if (options?.select) {
          repository.select(options.select);
        }
        if (sort) {
          const [field, order] = sort;
          repository.sort({
            [field]: order === 'ASC' ? 1 : -1,
          });
        }
        if (range) {
          const [start, end] = range;
          const limit = end ? end - start + 1 : 10;
          repository = repository.skip(start).limit(limit);
        }
        const result = await repository.lean({ transform }).exec();
        return Promise.resolve({ count, result });
      }) as Promise<{ count: number; result: T[] }>;
  }

  findAll(
    conditions: RootFilterQuery<T> = {},
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T>
  ): Promise<T[]> {
    const repository = this.Model.find(conditions, projection);

    if (options?.sort) {
      repository.sort(options.sort);
    }
    if (options?.populate) {
      // Ensure join is never a plain string for populate
      if (typeof options.populate === 'string') {
        repository.populate([options.populate]);
      } else {
        repository.populate(options.populate);
      }
      return repository.exec().then(docs => docs.map(m => m.toObject()) as T[]);
    }

    return repository.lean({ transform }).exec() as Promise<T[]>;
  }

  findAllByIds(
    ids: string[] = [],
    projection?: ProjectionType<T> | null
  ): Promise<T[]> {
    return this.Model.find(
      {
        _id: { $in: ids.map(id => new Types.ObjectId(id)) },
      },
      projection
    )
      .lean({ transform })
      .then(res => Promise.resolve(res)) as Promise<T[]>;
  }

  findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<T> | null,
    join?: PopulateOptions | PopulateOptions[]
  ): Promise<T | null> {
    const repository = this.Model.findById(id, projection);
    if (join) {
      repository.populate(join);
    }
    return repository.lean({ transform }).exec() as Promise<T | null>;
  }

  findByIdAndUpdate(
    id: string,
    patch: UpdateQuery<T>,
    projection?: ProjectionType<T> | null
  ): Promise<T | null> {
    const options = { new: true, overwrite: false, select: projection };
    return this.Model.findByIdAndUpdate(id, patch, options)
      .lean({ transform })
      .exec() as Promise<T>;
  }

  findOne(
    conditions: RootFilterQuery<T>,
    projection?: ProjectionType<T> | null,
    join?: PopulateOptions | PopulateOptions[]
  ): Promise<T | null> {
    const repository = this.Model.findOne(conditions, projection);
    if (join) {
      repository.populate(join);
    }
    return repository.lean({ transform }).exec() as Promise<T | null>;
  }

  findOneAndUpdate(
    conditions: RootFilterQuery<T>,
    patch: UpdateQuery<T>,
    projection?: ProjectionType<T> | null
  ): Promise<T> {
    const options = { new: true, overwrite: false, select: projection };
    return this.Model.findOneAndUpdate(conditions, patch, options)
      .lean({ transform })
      .exec() as Promise<T>;
  }

  findOneAndUpsert(
    conditions: RootFilterQuery<T>,
    data?: UpdateQuery<T>,
    projection?: ProjectionType<T> | null
  ): Promise<T> {
    const options = {
      new: true,
      select: projection,
      setDefaultsOnInsert: true,
      upsert: true,
    };
    return this.Model.findOneAndUpdate(conditions, data, options)
      .lean({ transform })
      .exec() as Promise<T>;
  }

  findOneOrCreate(
    conditions: RootFilterQuery<T>,
    data?: UpdateQuery<T>
  ): Promise<T> {
    return this.findOne(conditions).then(doc => {
      if (doc) {
        return doc;
      } else {
        return this.create(merge({}, conditions, data));
      }
    });
  }

  create(obj: Entity): Promise<T> {
    return this.Model.create(obj).then(model => model.toObject() as T);
  }

  insertMany(objs: Entity[]): Promise<T[]> {
    return this.Model.insertMany(objs).then(
      docs => docs.map(m => m.toObject()) as T[]
    );
  }

  createMany(objs: Entity[]): Promise<T[]> {
    // create is a convenience method that automatically calls new Model() and save() for you
    return this.Model.create(objs).then(
      docs => docs.map(m => m.toObject()) as T[]
    );
  }

  findByIdAndDelete(id: string): Promise<T | null> {
    return this.Model.findByIdAndDelete({
      _id: new Types.ObjectId(id),
    }).exec();
  }

  findOneAndDelete(conditions: RootFilterQuery<T>): Promise<T | null> {
    return this.Model.findOneAndDelete(conditions).exec();
  }

  deleteMany(
    conditions: RootFilterQuery<T>
  ): Promise<{ deletedCount?: number }> {
    return this.Model.deleteMany(conditions)
      .exec()
      .then(result => {
        return { deletedCount: result.deletedCount };
      });
  }

  updateMany(objs: Entity[]): Promise<BulkWriteResult> {
    //Create bulk operations
    const ops = objs.map(obj => {
      //Ensure item is a model, to allow inclusion of default values
      if (!(obj instanceof this.Model)) {
        obj = new this.Model({
          _id: new Types.ObjectId(obj.id!),
          ...obj,
        });
      }
      // Convert to plain object
      if (obj instanceof this.Model) {
        obj = obj.toObject({ depopulate: true, versionKey: false });
      }

      return {
        updateOne: {
          filter: { _id: obj.id },
          update: obj,
          upsert: false,
        },
      };
    });
    return this.Model.bulkWrite(ops);
  }

  upsertMany(objs: Entity[]): Promise<BulkWriteResult> {
    type Entity = Record<string, any>;

    //Create bulk operations
    const ops = objs.map((obj: Entity) => {
      //Ensure item is a model, to allow inclusion of default values
      if (!(obj instanceof this.Model)) {
        obj = new this.Model({
          ...obj,
          _id: obj.id ? Types.ObjectId.createFromHexString(obj.id) : undefined,
        });
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
          upsert: true,
        },
      };
    });
    return this.Model.bulkWrite(ops);
  }
}
