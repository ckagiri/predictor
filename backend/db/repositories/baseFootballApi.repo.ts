import { Model } from 'mongoose';
import { forkJoin, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import { Converter } from '../converters/converter.js';
import { Entity } from '../models/base.model.js';
import {
  BaseRepository,
  BaseRepositoryImpl,
} from '../repositories/base.repo.js';

export interface BaseFootballApiRepository<T extends Entity>
  extends BaseRepository<T> {
  add$(obj: Entity, useConverter?: boolean): Observable<T>;
  findByExternalId$(id: number | string): Observable<T | null>;
  findByExternalIdAndUpdate$(id: any, obj?: any): Observable<T>;
  findByExternalIds$(ids: (number | string)[]): Observable<T[]>;
  findEachByExternalIdAndUpdate$(objs: Entity[]): Observable<T[]>;
  footballApiProvider: ApiProvider;
}

export class BaseFootballApiRepositoryImpl<T extends Entity>
  extends BaseRepositoryImpl<T>
  implements BaseFootballApiRepository<T>
{
  get footballApiProvider() {
    return this.converter.footballApiProvider;
  }

  protected converter: Converter;

  constructor(SchemaModel: Model<T>, converter: Converter) {
    super(SchemaModel);
    this.converter = converter;
  }

  public findByExternalId$(id: number | string): Observable<T | null> {
    const externalIdKey = `externalReference.${this.footballApiProvider}.id`;
    return this.findOne$({ [externalIdKey]: id });
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
        })
      );
    } else {
      return super.findOneAndUpdate$({ [externalIdKey]: id }, obj);
    }
  }

  public findByExternalIds$(ids: (number | string)[]): Observable<T[]> {
    const externalIdKey = `externalReference.${this.footballApiProvider}.id`;

    return this.findAll$({ [externalIdKey]: { $in: ids } });
  }

  public findEachByExternalIdAndUpdate$(objs: Entity[]): Observable<T[]> {
    const obs: Observable<T>[] = [];
    for (const obj of objs) {
      obs.push(this.findByExternalIdAndUpdate$(obj));
    }
    return forkJoin(obs);
  }

  public add$(obj: Entity, useConverter = true): Observable<T> {
    return (useConverter ? this.converter.from(obj) : of(obj)).pipe(
      mergeMap(entity => {
        return super.insert$(entity);
      })
    );
  }
}
