// Use the mongodb types from mongoose's dependency to avoid type conflicts
import type { BulkWriteResult } from 'mongoose/node_modules/mongodb';

import {
  Model,
  ObjectId,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  UpdateQuery,
} from 'mongoose';
import { from, Observable } from 'rxjs';

import { Entity } from '../models/base.model.js';
import { DocumentDao } from './document.dao.js';
import { DatabaseOptions, FindQuery } from './interfaces.js';

export interface BaseRepository<T extends Entity> {
  count$(conditions?: RootFilterQuery<T>): Observable<number>;
  create$(obj: Entity): Observable<T>;
  createMany$(objs: Entity[]): Observable<T[]>;
  distinct$(
    field: string,
    conditions?: RootFilterQuery<T>
  ): Observable<string[]>;
  find$(
    query: FindQuery,
    options?: DatabaseOptions
  ): Observable<{ count: number; result: T[] }>;
  findAll$(
    conditions?: RootFilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T>
  ): Observable<T[]>;
  findAllByIds$(
    ids: string[],
    projection?: ProjectionType<T> | null
  ): Observable<T[]>;
  findById$(
    id: string | ObjectId,
    projection?: ProjectionType<T> | null
  ): Observable<T | null>;
  findByIdAndUpdate$(
    id: string | ObjectId,
    patch: UpdateQuery<T>,
    projection?: ProjectionType<T> | null
  ): Observable<T | null>;
  findOne$(
    conditions: RootFilterQuery<T>,
    projection?: ProjectionType<T> | null,
    join?: PopulateOptions | PopulateOptions[]
  ): Observable<T | null>;
  findOneAndDelete$(conditions: RootFilterQuery<T>): Observable<T | null>;
  findOneAndUpdate$(
    conditions: RootFilterQuery<T>,
    patch: UpdateQuery<T>,
    projection?: ProjectionType<T> | null
  ): Observable<T>;
  findOneAndUpsert$(
    conditions: RootFilterQuery<T>,
    data?: UpdateQuery<T>,
    projection?: ProjectionType<T> | null
  ): Observable<T>;
  findOneOrCreate$(
    conditions: RootFilterQuery<T>,
    data?: UpdateQuery<T>
  ): Observable<T>;
  insertMany$(objs: Entity[]): Observable<T[]>;
  updateMany$(objs: Entity[]): Observable<BulkWriteResult>;
  upsertMany$(objs: Entity[]): Observable<BulkWriteResult>;
}

export class BaseRepositoryImpl<T extends Entity> implements BaseRepository<T> {
  private documentDao: DocumentDao<T>;

  constructor(SchemaModel: Model<T>) {
    this.documentDao = new DocumentDao<T>(SchemaModel);
  }
  count$(conditions?: RootFilterQuery<T>): Observable<number> {
    return from(this.documentDao.count(conditions));
  }
  create$(obj: Entity): Observable<T> {
    return from(this.documentDao.create(obj));
  }
  createMany$(objs: Entity[]): Observable<T[]> {
    return from(this.documentDao.createMany(objs));
  }
  distinct$(
    field: string,
    conditions?: RootFilterQuery<T>
  ): Observable<string[]> {
    return from(this.documentDao.distinct(field, conditions));
  }
  find$(
    query: FindQuery,
    options?: DatabaseOptions
  ): Observable<{ count: number; result: T[] }> {
    return from(this.documentDao.find(query, options));
  }
  findAll$(
    conditions?: RootFilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T>
  ): Observable<T[]> {
    const queryOptions: QueryOptions<T> & { lean: true } = options
      ? { ...options, lean: true as const }
      : { lean: true as const };
    return from(this.documentDao.findAll(conditions, projection, queryOptions));
  }
  findAllByIds$(
    ids: string[],
    projection?: ProjectionType<T> | null
  ): Observable<T[]> {
    return from(this.documentDao.findAllByIds(ids, projection));
  }
  findById$(
    id: string | ObjectId,
    projection?: ProjectionType<T> | null
  ): Observable<T | null> {
    return from(this.documentDao.findById(id, projection));
  }
  findByIdAndUpdate$(
    id: string,
    patch: UpdateQuery<T>,
    projection?: ProjectionType<T> | null
  ): Observable<T | null> {
    return from(this.documentDao.findByIdAndUpdate(id, patch, projection));
  }
  findOne$(
    conditions: RootFilterQuery<T>,
    projection?: ProjectionType<T> | null,
    join?: PopulateOptions | PopulateOptions[]
  ): Observable<T | null> {
    return from(this.documentDao.findOne(conditions, projection, join));
  }
  findOneAndDelete$(conditions: RootFilterQuery<T>): Observable<T | null> {
    return from(this.documentDao.findOneAndDelete(conditions));
  }
  findOneAndUpdate$(
    conditions: RootFilterQuery<T>,
    patch: UpdateQuery<T>,
    projection?: ProjectionType<T> | null
  ): Observable<T> {
    return from(
      this.documentDao.findOneAndUpdate(conditions, patch, projection)
    );
  }
  findOneAndUpsert$(
    conditions: RootFilterQuery<T>,
    data?: UpdateQuery<T>,
    projection?: ProjectionType<T> | null
  ): Observable<T> {
    return from(
      this.documentDao.findOneAndUpsert(conditions, data, projection)
    );
  }
  findOneOrCreate$(
    conditions: RootFilterQuery<T>,
    data?: UpdateQuery<T>
  ): Observable<T> {
    return from(this.documentDao.findOneOrCreate(conditions, data));
  }
  insertMany$(objs: Entity[]): Observable<T[]> {
    return from(this.documentDao.insertMany(objs));
  }
  updateMany$(objs: Entity[]): Observable<BulkWriteResult> {
    return from(this.documentDao.updateMany(objs));
  }
  upsertMany$(objs: Entity[]): Observable<BulkWriteResult> {
    return from(this.documentDao.upsertMany(objs));
  }
}
