import { Observable, Subscriber } from 'rxjs';
import { Model } from 'mongoose';

import { DocumentDao } from './document.dao';
import { Entity } from '../models/base.model';

export interface BaseRepository<T extends Entity> {
  save$(obj: Entity): Observable<T>;
  insert$(obj: Entity): Observable<T>;
  saveMany$(objs: Entity[]): Observable<T[]>;
  insertMany$(objs: Entity[]): Observable<T[]>;
  upsertMany$(objs: Entity[]): Observable<any>;
  findByIdAndUpdate$(id: string, update: any): Observable<T>;
  findOneAndUpdate$(conditions: any, update: any, options?: any): Observable<T>;
  findOneAndUpsert$(conditions: any, update: any, options?: any): Observable<T>;
  distinct$(field: string, conditions?: any): Observable<string[]>
  findAll$(conditions?: any, projection?: any, options?: any): Observable<T[]>;
  find$(
    query?: any,
    projection?: any,
    options?: any,
  ): Observable<{ result: T[]; count: number }>;
  findOne$(conditions: any, projection?: any): Observable<T>;
  findById$(id: string): Observable<T>;
  findAllByIds$(ids?: string[]): Observable<T[]>;
  remove$(id: string): Observable<void>;
  count$(conditions: any): Observable<number>;
}

export class BaseRepositoryImpl<T extends Entity> implements BaseRepository<T> {

  private documentDao: DocumentDao<T>;

  constructor(SchemaModel: Model<T>) {
    this.documentDao = new DocumentDao<T>(SchemaModel);
  }

  public save$(obj: Entity): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.save(obj).then(
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
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.saveMany(objs).then(
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
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.insert(obj).then(
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
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.insertMany(objs).then(
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

  public upsertMany$(objs: Entity[]): Observable<any> {
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.upsertMany(objs).then(
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

  public updateMany$(objs: Entity[]): Observable<any> {
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.updateMany(objs).then(
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
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.findByIdAndUpdate(id, update).then(
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
    options: any = { overwrite: false, new: true },
  ): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.findOneAndUpdate(conditions, update, options).then(
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

  public findOneAndUpsert$(
    conditions: any,
    update: any,
    options: any = { upsert: true, new: true, setDefaultsOnInsert: true },
  ): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.findOneAndUpsert(conditions, update, options).then(
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

  public distinct$(field: string, conditions?: any): Observable<string[]> {
    return new Observable((observer: Subscriber<string[]>) => {
      this.documentDao.distinct(field, conditions).then(
        (result: string[]) => {
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
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.findAll(conditions, '-__v', options).then(
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

  public find$(
    query?: any,
    _projection?: any,
    options?: any,
  ): Observable<{ result: T[]; count: number }> {
    return new Observable(
      (observer: Subscriber<{ result: T[]; count: number }>) => {
        this.documentDao.find(query, '-__v', options).then(
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
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.findOne(conditions).then(
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
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.findById(id).then(
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

  public findAllByIds$(ids: string[] = []): Observable<T[]> {
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.findAllByIds(ids).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  public remove$(id: string): Observable<void> {
    return new Observable((observer: Subscriber<void>) => {
      this.documentDao.remove(id).then(
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
    return new Observable((observer: Subscriber<number>) => {
      this.documentDao.count(conditions).then(
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
