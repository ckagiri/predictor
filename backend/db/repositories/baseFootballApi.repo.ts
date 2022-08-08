import { Observable, forkJoin, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Model } from 'mongoose';
import _ from 'lodash';

import { BaseRepositoryImpl, BaseRepository } from '../repositories/base.repo';
import { Entity } from '../models/base.model';
import { Converter } from '../converters/converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface BaseFootballApiRepository<T extends Entity>
  extends BaseRepository<T> {
  footballApiProvider: ApiProvider;
  save$(obj: Entity, useConverter?: boolean): Observable<T>;
  findByExternalIdAndUpdate$(id: any, obj?: any): Observable<T>;
  findEachByExternalIdAndUpdate$(objs: Entity[]): Observable<T[]>;
  findByExternalId$(id: string | number): Observable<T>;
  findByExternalIds$(ids: Array<string | number>): Observable<T[]>;
}

export class BaseFootballApiRepositoryImpl<
  T extends Entity,
  > extends BaseRepositoryImpl<T>
  implements BaseFootballApiRepository<T> {
  protected converter: Converter;

  constructor(SchemaModel: Model<T>, converter: Converter) {
    super(SchemaModel);
    this.converter = converter;
  }

  get footballApiProvider() {
    return this.converter.footballApiProvider;
  }

  public save$(obj: Entity, useConverter: boolean = true): Observable<T> {
    return (useConverter ? this.converter.from(obj) : of(obj))
      .pipe(
        mergeMap(entity => {
          return super.save$(entity);
        })
      );
  }

  public findByExternalIdAndUpdate$(id: any, obj?: any): Observable<T> {
    const externalIdKey = `externalReference.${this.footballApiProvider}.id`;
    if (obj === undefined) {
      obj = id;
      id = obj.id;
      return this.converter.from(obj).pipe(
        mergeMap((entity: any) => {
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
    const externalIdKey = `externalReference.${this.footballApiProvider}.id`;
    return this.findOne$({ [externalIdKey]: id });
  }

  public findByExternalIds$(ids: Array<string | number>): Observable<T[]> {
    const externalIdKey = `externalReference.${this.footballApiProvider}.id`;

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
        mergeMap((updatedObj: T) => {
          // todo: find a better way to do this
          if (externalReference === undefined) {
            return of(updatedObj);
          }
          _.merge(updatedObj, { externalReference });
          return super.save$(updatedObj);
        }),
      );
  }
}
