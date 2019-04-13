import { Observable, Observer, Subscriber, forkJoin, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Model, Document } from 'mongoose';
import * as _ from 'lodash';

import { BaseRepository, IBaseRepository } from '../repositories/base.repo';
import { IEntity, IDocumentEntity } from '../models/base.model';
import { IConverter } from '../converters/converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface IBaseProviderRepository<T extends IDocumentEntity> {
  Provider: ApiProvider;
  save$(obj: IEntity): Observable<T>;
  findByExternalIdAndUpdate$(id: any, obj?: any): Observable<T>;
  findEachByExternalIdAndUpdate$(objs: IEntity[]): Observable<T[]>;
  findByExternalId$(id: string|number): Observable<T>;
  findByExternalIds$(ids: Array<string|number>): Observable<T[]>;
}

export class BaseProviderRepository<T extends IDocumentEntity> implements IBaseProviderRepository<T> {
  protected _baseRepo: IBaseRepository<T>;
  protected _converter: IConverter;

  constructor(schemaModel: Model<Document>, converter: IConverter) {
    this._baseRepo = new BaseRepository<T>(schemaModel);
    this._converter = converter;
  }

  get Provider() {
    return this._converter.provider;
  }

  save$(obj: IEntity): Observable<T> {
    return this._converter.from(obj).pipe(
      flatMap(entity => {
        return this._baseRepo.save$(entity)
      }));
  }

  findByExternalIdAndUpdate$(id: any, obj?: any): Observable<T> {
    const externalIdKey = `externalReference.${this.Provider}.id`;
    if (obj == undefined){
      obj = id;
      id = obj.id;
      return this._converter.from(obj).pipe(
        flatMap((entity: any) => {
          const { externalReference } = entity;
          delete entity.externalReference;
          return this._baseRepo.findOneAndUpdate$({ [externalIdKey]: id }, entity);
      }))
    } else {
      return this._baseRepo.findOneAndUpdate$({ [externalIdKey]: id }, obj);
    }
  }

  findEachByExternalIdAndUpdate$(objs: IEntity[]): Observable<T[]> {
    const obs: any[] = [];
    for (const obj of objs) {
      obs.push(this.findByExternalIdAndUpdate$(obj));
    }
    return forkJoin(obs);
  } ;

  findByExternalId$(id: string|number): Observable<T> {
		const externalIdKey = `externalReference.${this.Provider}.id`;
    return this.findOne$({ [externalIdKey]: id });
  }

  findByExternalIds$(ids: Array<string|number>): Observable<T[]> {
		const externalIdKey = `externalReference.${this.Provider}.id`;

    return this.findAll$({ [externalIdKey]: { $in : ids } });
  }

  saveMany$(objs: IEntity[]): Observable<T[]> {
    return this._baseRepo.saveMany$(objs);
  }

  insert$(obj: IEntity): Observable<T> {
    return this._baseRepo.insert$(obj);
  }

  insertMany$(objs: IEntity[]): Observable<T[]> {
    return this._baseRepo.insertMany$(objs);
  }

  findByIdAndUpdate$(id: string, update: any): Observable<T> {
    return this._baseRepo.findByIdAndUpdate$(id, update);
  }

  findOneAndUpdate$(conditions: any, update: any): Observable<T> {
    return this._baseRepo.findOneAndUpdate$(conditions, update);
  }

  findAll$(conditions?: any, projection?: any, options?: any): Observable<T[]> {
    return this._baseRepo.findAll$(conditions, projection, options);
  }

  findById$(id: string) {
    return this._baseRepo.findById$(id);
  }

  findOne$(conditions: any) {
    return this._baseRepo.findOne$(conditions);
  }

  protected _findOneAndUpsert$(conditions: any, obj: IEntity, externalReference: any): Observable<T> {
    return this._baseRepo.findOneAndUpdate$(conditions, obj, { new: true, upsert: true }).pipe(
      flatMap((updatedObj: T) => {
        if(externalReference === undefined) {
          return of(updatedObj);
        }
        _.merge(updatedObj, { externalReference });
        return this._baseRepo.save$(updatedObj);
      }));
  }
}