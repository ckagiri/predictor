import { Observable, Subscriber } from 'rxjs';

import { DocumentDao } from './document.dao';
import { Entity, DocumentEntity } from '../models/base.model';

export interface BaseRepository<T extends Entity> {
  save$(obj: Entity): Observable<T>;
  insert$(obj: Entity): Observable<T>;
  saveMany$(objs: Entity[]): Observable<T[]>;
  insertMany$(objs: Entity[]): Observable<T[]>;
  findByIdAndUpdate$(id: string, update: any): Observable<T>;
  findOneAndUpdate$(conditions: any, update: any, options?: any): Observable<T>;
  findAll$(conditions?: any, projection?: any, options?: any): Observable<T[]>;
  find$(
    requestQuery?: any,
    projection?: any,
    options?: any,
  ): Observable<{ result: T[]; count: number }>;
  findOne$(conditions: any, projection?: any): Observable<T>;
  findById$(id: string): Observable<T>;
  remove$(id: string): Observable<void>;
  count$(conditions: any): Observable<number>;
}

export class BaseRepositoryImpl<
  T extends Entity,
  TDocument extends T & DocumentEntity
> extends DocumentDao<TDocument> implements BaseRepository<T> {
  public save$(obj: Entity): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.save(obj).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }

  public saveMany$(objs: Entity[]): Observable<T[]> {
    return Observable.create((observer: Subscriber<T[]>) => {
      this.saveMany(objs).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }

  public insert$(obj: Entity): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.insert(obj).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }

  public insertMany$(objs: Entity[]): Observable<T[]> {
    return Observable.create((observer: Subscriber<T[]>) => {
      this.insertMany(objs).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }

  public findByIdAndUpdate$(id: string, update: any): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.findByIdAndUpdate(id, update).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }

  public findOneAndUpdate$(
    conditions: any,
    update: any,
    options?: any,
  ): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.findOneAndUpdate(conditions, update, options).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }

  public findAll$(
    conditions?: any,
    _projection?: any,
    options?: any,
  ): Observable<T[]> {
    return Observable.create((observer: Subscriber<T[]>) => {
      this.findAll(conditions, '-__v -externalReference', options).then(
        (result: TDocument[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }

  public find$(
    requestQuery?: any,
    _projection?: any, // Todo: figure out
    options?: any,
  ): Observable<{ result: T[]; count: number }> {
    return Observable.create(
      (observer: Subscriber<{ result: T[]; count: number }>) => {
        this.find(requestQuery, '-__v -externalReference', options).then(
          ({ result, count }) => {
            observer.next({ result, count });
            observer.complete();
          },
          (error: any) => {
            observer.error(error);
          },
        );
      },
    );
  }

  public findOne$(conditions: any, projection?: any): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.findOne(conditions).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }

  public findById$(id: string): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.findById(id).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }

  public remove$(id: string): Observable<void> {
    return Observable.create((observer: Subscriber<void>) => {
      this.remove(id).then(
        () => {
          observer.next();
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }

  public count$(conditions: any): Observable<number> {
    return Observable.create((observer: Subscriber<number>) => {
      this.count(conditions).then(
        (result: number) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        },
      );
    });
  }
}
