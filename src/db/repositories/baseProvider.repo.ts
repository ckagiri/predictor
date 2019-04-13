import { Observable, Observer, Subscriber, forkJoin, of } from "rxjs";
import { flatMap } from "rxjs/operators";
import { Model, Document } from "mongoose";
import * as _ from "lodash";

import { BaseRepository, IBaseRepository } from "../repositories/base.repo";
import { IEntity, IDocumentEntity } from "../models/base.model";
import { IConverter } from "../converters/converter";
import { FootballApiProvider as ApiProvider } from "../../common/footballApiProvider";

export interface IBaseProviderRepository<T extends IDocumentEntity>
  extends IBaseRepository<T> {
  Provider: ApiProvider;
  save$(obj: IEntity): Observable<T>;
  findByExternalIdAndUpdate$(id: any, obj?: any): Observable<T>;
  findEachByExternalIdAndUpdate$(objs: IEntity[]): Observable<T[]>;
  findByExternalId$(id: string | number): Observable<T>;
  findByExternalIds$(ids: Array<string | number>): Observable<T[]>;
}

export class BaseProviderRepository<T extends IDocumentEntity>
  extends BaseRepository<T>
  implements IBaseProviderRepository<T> {
  protected converter: IConverter;

  constructor(SchemaModel: Model<Document>, converter: IConverter) {
    super(SchemaModel);
    this.converter = converter;
  }

  get Provider() {
    return this.converter.provider;
  }

  save$(obj: IEntity): Observable<T> {
    return this.converter.from(obj).pipe(
      flatMap(entity => {
        return super.save$(entity);
      })
    );
  }

  findByExternalIdAndUpdate$(id: any, obj?: any): Observable<T> {
    const externalIdKey = `externalReference.${this.Provider}.id`;
    if (obj === undefined) {
      obj = id;
      id = obj.id;
      return this.converter.from(obj).pipe(
        flatMap((entity: any) => {
          delete entity.externalReference;
          return super.findOneAndUpdate$({ [externalIdKey]: id }, entity);
        })
      );
    } else {
      return super.findOneAndUpdate$({ [externalIdKey]: id }, obj);
    }
  }

  findEachByExternalIdAndUpdate$(objs: IEntity[]): Observable<T[]> {
    const obs: any[] = [];
    for (const obj of objs) {
      obs.push(this.findByExternalIdAndUpdate$(obj));
    }
    return forkJoin(obs);
  }

  findByExternalId$(id: string | number): Observable<T> {
    const externalIdKey = `externalReference.${this.Provider}.id`;
    return this.findOne$({ [externalIdKey]: id });
  }

  findByExternalIds$(ids: Array<string | number>): Observable<T[]> {
    const externalIdKey = `externalReference.${this.Provider}.id`;

    return this.findAll$({ [externalIdKey]: { $in: ids } });
  }

  protected _findOneAndUpsert$(
    conditions: any,
    obj: IEntity,
    externalReference: any
  ): Observable<T> {
    return super
      .findOneAndUpdate$(conditions, obj, { new: true, upsert: true })
      .pipe(
        flatMap((updatedObj: T) => {
          if (externalReference === undefined) {
            return of(updatedObj);
          }
          _.merge(updatedObj, { externalReference });
          return super.save$(updatedObj);
        })
      );
  }
}
