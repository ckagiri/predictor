import { Observable, Observer, Subscriber, forkJoin, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Model, Document } from 'mongoose';
import * as _ from 'lodash';

import { BaseRepositoryImpl, BaseRepository } from '../repositories/base.repo';
import { Entity, DocumentEntity } from '../models/base.model';
import { Converter } from '../converters/converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface BaseFootballApiRepository<T extends Entity>
  extends BaseRepository<T> {
  FootballApiProvider: ApiProvider;
  save$(obj: Entity): Observable<T>;
  findByExternalIdAndUpdate$(id: any, obj?: any): Observable<T>;
  findEachByExternalIdAndUpdate$(objs: Entity[]): Observable<T[]>;
  findByExternalId$(id: string | number): Observable<T>;
  findByExternalIds$(ids: Array<string | number>): Observable<T[]>;
}

export class BaseFootballApiRepositoryImpl<
  T extends Entity,
  TDocument extends T & DocumentEntity
  > extends BaseRepositoryImpl<T, TDocument>
  implements BaseFootballApiRepository<T> {
  protected converter: Converter;

  constructor(SchemaModel: Model<Document>, converter: Converter) {
    super(SchemaModel);
    this.converter = converter;
  }

  get FootballApiProvider() {
    return this.converter.footballApiProvider;
  }

  public save$(obj: Entity): Observable<T> {
    return this.converter.from(obj).pipe(
      flatMap(entity => {
        return super.save$(entity);
      }),
    );
  }

  public findByExternalIdAndUpdate$(id: any, obj?: any): Observable<T> {
    const externalIdKey = `externalReference.${this.FootballApiProvider}.id`;
    if (obj === undefined) {
      obj = id;
      id = obj.id;
      return this.converter.from(obj).pipe(
        flatMap((entity: any) => {
          delete entity.externalReference;
          return super.findOneAndUpdate$({ [externalIdKey]: id }, entity);
        }),
      );
    } else {
      return super.findOneAndUpdate$({ [externalIdKey]: id }, obj);
    }
  }

  public findEachByExternalIdAndUpdate$(objs: Entity[]): Observable<T[]> {
    const obs: Array<Observable<T>> = [];
    for (const obj of objs) {
      obs.push(this.findByExternalIdAndUpdate$(obj));
    }
    return forkJoin(obs);
  }

  public findByExternalId$(id: string | number): Observable<T> {
    const externalIdKey = `externalReference.${this.FootballApiProvider}.id`;
    return this.findOne$({ [externalIdKey]: id });
  }

  public findByExternalIds$(ids: Array<string | number>): Observable<T[]> {
    const externalIdKey = `externalReference.${this.FootballApiProvider}.id`;

    return this.findAll$({ [externalIdKey]: { $in: ids } });
  }

  protected _findOneAndUpsert$(
    conditions: any,
    obj: Entity,
    externalReference: any,
  ): Observable<T> {
    return super
      .findOneAndUpdate$(conditions, obj, { new: true, upsert: true })
      .pipe(
        flatMap((updatedObj: T) => {
          if (externalReference === undefined) {
            // Todo: check if external ref exists in updated Object
            return of(updatedObj);
          }
          _.merge(updatedObj, { externalReference });
          return super.save$(updatedObj);
        }),
      );
  }
}
